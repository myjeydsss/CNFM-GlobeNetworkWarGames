// server.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const util = require("util");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

/* -------------------- Config from .env with fallbacks -------------------- */
const PORT = process.env.PORT || 5266;

const MYSQL_HOST = process.env.MYSQL_HOST || "localhost";
const MYSQL_USER = process.env.MYSQL_USER || "root";
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || "";
const MYSQL_DATABASE = process.env.MYSQL_DATABASE || "cnfm_wargames";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "*";

/* ------------------------------ Middleware ------------------------------ */
app.use(
  cors({
    origin: CLIENT_ORIGIN === "*" ? "*" : [CLIENT_ORIGIN],
  })
);
app.use(express.json());

/* ------------------------------- MySQL Pool ------------------------------ */
const pool = mysql.createPool({
  host: MYSQL_HOST,
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  database: MYSQL_DATABASE,
  connectionLimit: 10,
});
const query = util.promisify(pool.query).bind(pool);

async function ensurePublishedSnapshotsTable() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS topologypublished (
        site_id INT PRIMARY KEY,
        payload JSON NOT NULL,
        meta JSON NULL,
        updated_by INT NULL,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_topologypublished_site FOREIGN KEY (site_id)
          REFERENCES site(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await query(`
      INSERT INTO topologypublished (site_id, payload, meta, updated_by, updated_at, created_at)
      SELECT td.site_id, td.payload, td.meta, td.updated_by, td.updated_at, td.created_at
        FROM topologydraft td
       WHERE EXISTS (SELECT 1 FROM link l WHERE l.site_id = td.site_id)
      ON DUPLICATE KEY UPDATE
        payload = VALUES(payload),
        meta = VALUES(meta),
        updated_by = VALUES(updated_by),
        updated_at = VALUES(updated_at);
    `);
  } catch (err) {
    console.error("topologypublished init error:", err);
  }
}
ensurePublishedSnapshotsTable();
ensureUsersMustChangeColumn();

async function ensureUsersMustChangeColumn() {
  try {
    const columns = await query(
      "SHOW COLUMNS FROM users LIKE 'must_change_password'"
    );
    if (!columns.length) {
      await query(
        `ALTER TABLE users
           ADD COLUMN must_change_password TINYINT(1) NOT NULL DEFAULT 0
           AFTER status`
      );
    }
  } catch (err) {
    if (err?.code === "ER_DUP_FIELDNAME") return;
    console.error("must_change_password column check failed:", err);
  }
}

/* ------------------------------- JWT utils ------------------------------- */
function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      username: user.username,
      role: user.role,
      firstname: user.firstname,
      lastname: user.lastname,
      mustChangePassword: !!user.mustChangePassword,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function authRequired(req, res, next) {
  const hdr = req.headers.authorization || "";
  const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;
  if (!token) return res.status(401).json({ message: "missing_token" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { sub, username, role, firstname, lastname, iat, exp }
    next();
  } catch (e) {
    return res.status(401).json({ message: "invalid_or_expired_token" });
  }
}

const ROLE_RANK = {
  guest: 0,
  user: 1,
  site_admin: 2,
  admin: 3, // legacy full-admin
  super_admin: 4,
};
function requireRole(minRole) {
  const minRank = ROLE_RANK[minRole] ?? ROLE_RANK.admin;
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role || (ROLE_RANK[role] ?? -1) < minRank) {
      return res.status(403).json({ message: "forbidden" });
    }
    next();
  };
}

async function userHasSiteAccess(user, siteId) {
  if (!user || !siteId) return false;
  const rank = ROLE_RANK[user.role] ?? -1;
  if (rank >= ROLE_RANK.admin) return true; // legacy admin & super_admin have global access
  if (user.role === "site_admin") {
    const rows = await query(
      `SELECT 1 FROM site_admins
        WHERE user_id = ? AND site_id = ? AND revoked_at IS NULL
        LIMIT 1`,
      [user.sub, siteId]
    );
    return rows.length > 0;
  }
  return false;
}

async function ensureSiteAccess(req, res, siteId) {
  if (!siteId) {
    res.status(400).json({ message: "invalid_site_id" });
    return false;
  }
  const allowed = await userHasSiteAccess(req.user, siteId);
  if (!allowed) {
    res.status(403).json({ message: "forbidden" });
    return false;
  }
  return true;
}

async function getAccessibleSiteIds(user) {
  if (!user) return [];
  const rank = ROLE_RANK[user.role] ?? -1;
  if (rank >= ROLE_RANK.admin) return null;
  const rows = await query(
    `SELECT DISTINCT site_id AS siteId
       FROM site_admins
      WHERE user_id = ? AND revoked_at IS NULL`,
    [user.sub]
  );
  return rows.map((row) => Number(row.siteId));
}

async function fetchUsersWithSites(userIds) {
  const idList =
    Array.isArray(userIds) && userIds.length
      ? Array.from(new Set(userIds.map((id) => Number(id)).filter((id) => id > 0)))
      : null;

  let userSql = `
    SELECT id, firstname, lastname, username, role, status
      FROM users
  `;
  const userParams = [];
  if (idList) {
    userSql += ` WHERE id IN (${idList.map(() => "?").join(",")})`;
    userParams.push(...idList);
  }
  userSql += `
    ORDER BY FIELD(role,'super_admin','admin','site_admin','user','guest'),
             lastname, firstname, username
  `;
  const userRows = await query(userSql, userParams);
  if (!userRows.length) return [];

  let assignmentSql = `
    SELECT sa.user_id AS userId,
           sa.site_id AS siteId,
           s.code,
           s.name,
           r.code AS regionCode,
           r.name AS regionName,
           sa.is_primary AS isPrimary
      FROM site_admins sa
      INNER JOIN site s ON s.id = sa.site_id
      LEFT JOIN region r ON r.id = s.region_id
     WHERE sa.revoked_at IS NULL
  `;
  let assignmentParams = [];
  if (idList) {
    assignmentSql += ` AND sa.user_id IN (${idList.map(() => "?").join(",")})`;
    assignmentParams = idList;
  }
  assignmentSql += " ORDER BY s.name";
  const assignmentRows = await query(assignmentSql, assignmentParams);
  const siteMap = new Map();
  assignmentRows.forEach((row) => {
    if (!siteMap.has(row.userId)) siteMap.set(row.userId, []);
    siteMap.get(row.userId).push({
      siteId: row.siteId,
      code: row.code,
      name: row.name,
      regionCode: row.regionCode,
      regionName: row.regionName,
      isPrimary: !!row.isPrimary,
    });
  });

  return userRows.map((user) => ({
    id: user.id,
    firstname: user.firstname,
    lastname: user.lastname,
    username: user.username,
    role: user.role,
    status: user.status,
    assignedSites: siteMap.get(user.id) ?? [],
  }));
}

async function fetchUserWithSites(userId) {
  const list = await fetchUsersWithSites([userId]);
  return list[0] || null;
}

const getConnection = util.promisify(pool.getConnection).bind(pool);

async function runInTransaction(work) {
  const conn = await getConnection();
  const connQuery = util.promisify(conn.query).bind(conn);
  try {
    await connQuery("START TRANSACTION");
    const result = await work(connQuery, conn);
    await connQuery("COMMIT");
    return result;
  } catch (err) {
    try {
      await connQuery("ROLLBACK");
    } catch (rollbackErr) {
      console.error("rollback error:", rollbackErr);
    }
    throw err;
  } finally {
    conn.release();
  }
}

/* ------------------------------ AUTH Routes ------------------------------ */

// POST /api/auth/register
app.post("/api/auth/register", async (req, res) => {
  try {
    const { firstname, lastname, username, password, role } = req.body || {};

    const safeFirstname = typeof firstname === "string" ? firstname.trim() : "";
    const safeLastname = typeof lastname === "string" ? lastname.trim() : "";
    const safeUsername = typeof username === "string" ? username.trim() : "";

    if (!safeFirstname || !safeLastname)
      return res
        .status(400)
        .json({ message: "First name and last name are required." });
    if (!safeUsername)
      return res.status(400).json({ message: "Username is required." });
    if (!password || password.length < 8)
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters." });

    const allowedRoles = new Set(["admin", "guest"]);
    const requestedRole = typeof role === "string" ? role.trim() : "";
    const safeRole = allowedRoles.has(requestedRole) ? requestedRole : "guest";

    // Check if username exists
    const existing = await query(
      "SELECT id FROM users WHERE LOWER(username) = LOWER(?)",
      [safeUsername]
    );
    if (existing.length)
      return res.status(409).json({ message: "Username is already taken." });

    const hashed = await bcrypt.hash(password, 10);

    const result = await query(
      `INSERT INTO users (firstname, lastname, username, password, role, status, must_change_password)
       VALUES (?, ?, ?, ?, ?, 'active', 0)`,
      [safeFirstname, safeLastname, safeUsername, hashed, safeRole]
    );

    const user = {
      id: result.insertId,
      firstname: safeFirstname,
      lastname: safeLastname,
      username: safeUsername,
      role: safeRole,
      mustChangePassword: false,
    };

    const token = signToken(user);
    res.status(201).json({ token, user });
  } catch (err) {
    console.error("register error:", err);
    res.status(500).json({ message: "db_error" });
  }
});

// POST /api/auth/login
// Body: { username, password }
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    const safeUsername = typeof username === "string" ? username.trim() : "";
    if (!safeUsername || !password)
      return res
        .status(400)
        .json({ message: "Username and password are required." });

    const rows = await query(
      `SELECT id, firstname, lastname, username, password, role, status,
              must_change_password AS mustChangePassword
         FROM users
        WHERE LOWER(username) = LOWER(?)
        LIMIT 1`,
      [safeUsername]
    );

    if (!rows.length)
      return res.status(401).json({ message: "Invalid username or password." });

    const u = rows[0];
    if (u.status !== "active")
      return res.status(403).json({ message: "Account is inactive." });

    const ok = await bcrypt.compare(String(password), String(u.password));
    if (!ok)
      return res.status(401).json({ message: "Invalid username or password." });

    const user = {
      id: u.id,
      firstname: u.firstname,
      lastname: u.lastname,
      username: u.username,
      role: u.role,
      mustChangePassword: !!u.mustChangePassword,
    };

    const token = signToken(user);
    res.json({ token, user });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ message: "db_error" });
  }
});

// GET /api/auth/me
app.get("/api/auth/me", authRequired, async (req, res) => {
  res.json({
    user: {
      id: req.user.sub,
      username: req.user.username,
      role: req.user.role,
      firstname: req.user.firstname,
      lastname: req.user.lastname,
      mustChangePassword: !!req.user.mustChangePassword,
    },
  });
});

app.put("/api/auth/password", authRequired, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "current_and_new_password_required" });
    }
    if (String(newPassword).length < 10) {
      return res.status(400).json({ message: "new_password_too_short" });
    }

    const userId = req.user?.sub;
    const rows = await query(
      `SELECT id, firstname, lastname, username, password, role, status,
              must_change_password AS mustChangePassword
         FROM users
        WHERE id = ?
        LIMIT 1`,
      [userId]
    );
    if (!rows.length) {
      return res.status(404).json({ message: "user_not_found" });
    }
    const dbUser = rows[0];
    const matches = await bcrypt.compare(String(currentPassword), String(dbUser.password));
    if (!matches) {
      return res.status(400).json({ message: "incorrect_current_password" });
    }

    const hashed = await bcrypt.hash(String(newPassword), 10);
    await query(
      "UPDATE users SET password = ?, must_change_password = 0 WHERE id = ?",
      [hashed, userId]
    );

    const user = {
      id: dbUser.id,
      firstname: dbUser.firstname,
      lastname: dbUser.lastname,
      username: dbUser.username,
      role: dbUser.role,
      mustChangePassword: false,
    };
    const token = signToken(user);
    res.json({ token, user });
  } catch (err) {
    console.error("password update error:", err);
    res.status(500).json({ message: "password_update_failed" });
  }
});

app.put("/api/auth/profile", authRequired, async (req, res) => {
  try {
    const userId = req.user?.sub;
    const { firstname, lastname, username } = req.body || {};
    const safeFirstname =
      typeof firstname === "string" ? firstname.trim() : "";
    const safeLastname = typeof lastname === "string" ? lastname.trim() : "";
    const safeUsername = typeof username === "string" ? username.trim() : "";

    if (!safeUsername) {
      return res.status(400).json({ message: "username_required" });
    }

    const [existing] = await query(
      "SELECT id FROM users WHERE LOWER(username) = LOWER(?) AND id <> ? LIMIT 1",
      [safeUsername, userId]
    );
    if (existing) {
      return res.status(409).json({ message: "username_taken" });
    }

    await query(
      `UPDATE users
          SET firstname = ?,
              lastname = ?,
              username = ?
        WHERE id = ?`,
      [safeFirstname, safeLastname, safeUsername, userId]
    );

    const [row] = await query(
      `SELECT id, firstname, lastname, username, role, must_change_password AS mustChangePassword
         FROM users
        WHERE id = ?
        LIMIT 1`,
      [userId]
    );

    if (!row) {
      return res.status(404).json({ message: "user_not_found" });
    }

    const user = {
      id: row.id,
      firstname: row.firstname,
      lastname: row.lastname,
      username: row.username,
      role: row.role,
      mustChangePassword: !!row.mustChangePassword,
    };
    const token = signToken(user);
    res.json({ token, user });
  } catch (err) {
    console.error("profile update error:", err);
    res.status(500).json({ message: "profile_update_failed" });
  }
});

/* --------------------------- EXISTING Data Routes -------------------------- */

// GET /api/region
app.get("/api/region", async (_req, res) => {
  try {
    const rows = await query("SELECT id, code, name FROM region ORDER BY name");
    res.json(rows);
  } catch (err) {
    console.error("region error:", err);
    res.status(500).json({ error: "db_error" });
  }
});

// GET /api/region/:code/site
app.get("/api/region/:code/site", async (req, res) => {
  try {
    const [region] = await query("SELECT id FROM region WHERE code = ?", [
      req.params.code,
    ]);
    if (!region) return res.status(404).json({ message: "Region not found" });

    const sites = await query(
      `SELECT id, region_id AS regionId, code, name, x, y, width, height
         FROM site
        WHERE region_id = ?
        ORDER BY name`,
      [region.id]
    );
    res.json(sites);
  } catch (err) {
    console.error("sites error:", err);
    res.status(500).json({ error: "db_error" });
  }
});

app.get("/api/region/:code/published-site", async (req, res) => {
  const regionCode = String(req.params.code || "").toUpperCase();
  if (!regionCode) return res.status(400).json({ message: "invalid_region_code" });

  try {
    const rows = await query(
      `SELECT s.id, s.region_id AS regionId, s.code, s.name, s.x, s.y, s.width, s.height
         FROM site s
         INNER JOIN region r ON r.id = s.region_id
        WHERE r.code = ?
          AND EXISTS (SELECT 1 FROM topologypublished tp WHERE tp.site_id = s.id)
        ORDER BY s.name`,
      [regionCode]
    );
    res.json(rows);
  } catch (err) {
    console.error("published sites error:", err);
    res.status(500).json({ error: "db_error" });
  }
});

// GET /api/site/:siteCode/topology
app.get("/api/site/:siteCode/topology", async (req, res) => {
  try {
    const siteCode = req.params.siteCode;

    const [site] = await query(
      `SELECT id, code, name, x, y, width, height
         FROM site
        WHERE code = ?
        LIMIT 1`,
      [siteCode]
    );
    if (!site) return res.status(404).json({ message: "Site not found" });

    const staticRows = await query(
      `SELECT pathd AS pathD
         FROM staticpath
        WHERE site_id = ?
        ORDER BY id`,
      [site.id]
    );
    const staticPaths = staticRows.map((r) => r.pathD);

    const links = await query(
      `SELECT id, site_id, linkkey, displayname, fromnode, tonode
         FROM link
        WHERE site_id = ?
        ORDER BY id`,
      [site.id]
    );
    const linkIds = links.map((l) => l.id);

    let segRows = [];
    let loadRows = [];
    let labelRows = [];
    if (linkIds.length) {
      segRows = await query(
        `SELECT linkid, segorder, pathd, description
           FROM linksegment
          WHERE linkid IN (${linkIds.map(() => "?").join(",")})
          ORDER BY linkid, segorder`,
        linkIds
      );

      loadRows = await query(
        `SELECT linkid, loadtag
           FROM linkload
          WHERE linkid IN (${linkIds.map(() => "?").join(",")})
          ORDER BY linkid, id`,
        linkIds
      );

      labelRows = await query(
        `SELECT linkid, x, y, width, height
           FROM linklabel
          WHERE linkid IN (${linkIds.map(() => "?").join(",")})`,
        linkIds
      );
    }

    const svcRows = await query(
      `SELECT id, name, sort_order AS sortOrder
         FROM siteservice
        WHERE site_id = ?
        ORDER BY sort_order, id`,
      [site.id]
    );
    const services = svcRows.map((r) => ({
      id: r.id,
      name: r.name,
      sortOrder: Number.isFinite(r.sortOrder) ? Number(r.sortOrder) : 0,
    }));

    const byId = Object.fromEntries(
      links.map((l) => [
        l.id,
        {
          key: l.linkkey,
          displayName: l.displayname,
          from: l.fromnode,
          to: l.tonode,
          segments: [],
          load: [],
          label: undefined,
          edgeType: null,
          animated: false,
        },
      ])
    );

    segRows.forEach((s) => {
      const bucket = byId[s.linkid];
      if (bucket) {
        if (s.description) {
          try {
            const meta = JSON.parse(s.description);
            if (meta && typeof meta.type === "string") {
              bucket.edgeType = meta.type;
            }
            if (meta && typeof meta.animated !== "undefined") {
              bucket.animated = !!meta.animated;
            }
          } catch (err) {
            // ignore non-JSON descriptions
          }
        }
        bucket.segments.push({
          path: s.pathd,
          description: s.description || null,
        });
      }
    });

    loadRows.forEach((ld) => {
      const bucket = byId[ld.linkid];
      if (bucket) bucket.load.push(ld.loadtag);
    });

    labelRows.forEach((lr) => {
      const bucket = byId[lr.linkid];
      if (bucket) {
        bucket.label = {
          x: Number(lr.x),
          y: Number(lr.y),
          width: Number(lr.width),
          height: Number(lr.height),
        };
      }
    });

    const connections = links.map((l) => ({
      ...byId[l.id],
      edgeType: byId[l.id]?.edgeType,
      animated: byId[l.id]?.animated ?? false,
    }));

    // place nodes
    let placeNodes = [];
    try {
      const nodeRows = await query(
        `SELECT
           ll.node_code AS code,
           COALESCE(ll.node_name, s.name) AS name,
           ll.x, ll.y, ll.width, ll.height
         FROM linklabel ll
         LEFT JOIN site s
           ON s.code COLLATE utf8mb4_unicode_ci = ll.node_code COLLATE utf8mb4_unicode_ci
         WHERE ll.site_id = ? AND ll.type = 'node'
         ORDER BY ll.id`,
        [site.id]
      );

      placeNodes = nodeRows.map((r) => ({
        code: r.code,
        name: r.name,
        x: Number(r.x ?? 0),
        y: Number(r.y ?? 0),
        width: Number(r.width ?? 150),
        height: Number(r.height ?? 60),
      }));
    } catch (e) {
      console.error("placeNodes query error:", e);
      placeNodes = [];
    }

    if (placeNodes.length === 0) {
      const nodeCodesSet = new Set();
      links.forEach((l) => {
        if (l.fromnode && l.fromnode !== site.code)
          nodeCodesSet.add(l.fromnode);
        if (l.tonode && l.tonode !== site.code) nodeCodesSet.add(l.tonode);
      });
      const nodeCodes = Array.from(nodeCodesSet);
      if (nodeCodes.length) {
        const placeholders = nodeCodes.map(() => "?").join(",");
        const nodes = await query(
          `SELECT code, name, x, y, width, height
             FROM site
            WHERE code IN (${placeholders})
            ORDER BY name`,
          nodeCodes
        );
        placeNodes = nodes.map((n) => ({
          code: n.code,
          name: n.name,
          x: Number(n.x ?? 0),
          y: Number(n.y ?? 0),
          width: Number(n.width ?? 150),
          height: Number(n.height ?? 60),
        }));
      }
    }

    res.json({ site, staticPaths, connections, services, placeNodes });
  } catch (err) {
    console.error("topology error:", err);
    res.status(500).json({ error: "db_error" });
  }
});

// GET /siteservice
app.get("/siteservice", async (_req, res) => {
  try {
    const rows = await query(
      "SELECT id, site_id AS siteId, name, sort_order AS sortOrder FROM siteservice ORDER BY site_id, sort_order, id"
    );
    res.json(rows);
  } catch (err) {
    console.error("siteservice error:", err);
    res.status(500).json({ error: "db_error" });
  }
});

// GET /api/admin/my-sites
app.get(
  "/api/admin/my-sites",
  authRequired,
  requireRole("site_admin"),
  async (req, res) => {
    try {
      const role = req.user?.role ?? "guest";
      const rank = ROLE_RANK[role] ?? -1;
      const isGlobalAdmin = rank >= ROLE_RANK.admin;
      let rows;
      if (isGlobalAdmin) {
        rows = await query(
          `
          SELECT s.id,
                 s.code,
                 s.name,
                 r.code AS regionCode,
                 r.name AS regionName
            FROM site s
            LEFT JOIN region r ON r.id = s.region_id
        ORDER BY r.name IS NULL, r.name, s.name, s.id
        `
        );
      } else {
        const userId = req.user?.sub;
        if (!userId) {
          return res.status(400).json({ message: "invalid_user" });
        }
        rows = await query(
          `
          SELECT DISTINCT s.id,
                          s.code,
                          s.name,
                          r.code AS regionCode,
                          r.name AS regionName
            FROM site_admins sa
            INNER JOIN site s ON s.id = sa.site_id
            LEFT JOIN region r ON r.id = s.region_id
           WHERE sa.user_id = ?
             AND sa.revoked_at IS NULL
        ORDER BY r.name IS NULL, r.name, s.name, s.id
        `,
          [userId]
        );
      }
      const payload = (rows || []).map((row) => ({
        id: row.id,
        code: row.code,
        name: row.name,
        regionCode: row.regionCode || "",
        regionName: row.regionName || "",
      }));
      res.json(payload);
    } catch (err) {
      console.error("admin my-sites error:", err);
      res.status(500).json({ message: "db_error" });
    }
  }
);

// GET /api/admin/dashboard/overview
app.get(
  "/api/admin/dashboard/overview",
  authRequired,
  requireRole("site_admin"),
  async (req, res) => {
    try {
      const accessibleSiteIds = await getAccessibleSiteIds(req.user);
      if (Array.isArray(accessibleSiteIds)) {
        if (!accessibleSiteIds.length) {
          return res.json({
            metrics: {
              regions: 0,
              sites: 0,
              links: 0,
              services: 0,
              publishedSites: 0,
              draftsUpdated24h: 0,
            },
            regionBreakdown: [],
            recentActivity: [],
          });
        }
        const placeholders = accessibleSiteIds.map(() => "?").join(",");
        const build = () => [...accessibleSiteIds];

        const [
          regionRows,
          linkRows,
          serviceRows,
          publishedRows,
          drafts24Rows,
          regionBreakdownRows,
          recentDraftRows,
        ] = await Promise.all([
          query(
            `SELECT COUNT(DISTINCT region_id) AS count FROM site WHERE id IN (${placeholders})`,
            build()
          ),
          query(
            `SELECT COUNT(*) AS count FROM link WHERE site_id IN (${placeholders})`,
            build()
          ),
          query(
            `SELECT COUNT(*) AS count FROM siteservice WHERE site_id IN (${placeholders})`,
            build()
          ),
          query(
            `SELECT COUNT(DISTINCT site_id) AS count FROM topologypublished WHERE site_id IN (${placeholders})`,
            build()
          ),
          query(
            `SELECT COUNT(*) AS count FROM topologydraft
              WHERE site_id IN (${placeholders})
                AND updated_at >= NOW() - INTERVAL 1 DAY`,
            build()
          ),
          query(
            `SELECT r.id,
                    r.code,
                    r.name,
                    COUNT(DISTINCT s.id) AS siteCount,
                    COUNT(ss.id) AS serviceCount
               FROM site s
               LEFT JOIN region r ON r.id = s.region_id
               LEFT JOIN siteservice ss ON ss.site_id = s.id
              WHERE s.id IN (${placeholders})
           GROUP BY r.id, r.code, r.name
           ORDER BY r.name`,
            build()
          ),
          query(
            `SELECT td.site_id AS siteId,
                    s.code AS siteCode,
                    s.name AS siteName,
                    td.updated_at AS updatedAt,
                    td.updated_by AS updatedBy,
                    u.firstname,
                    u.lastname,
                    u.username
               FROM topologydraft td
               LEFT JOIN site s ON s.id = td.site_id
               LEFT JOIN users u ON u.id = td.updated_by
              WHERE td.site_id IN (${placeholders})
           ORDER BY td.updated_at DESC
              LIMIT 6`,
            build()
          ),
        ]);

        const metrics = {
          regions: Number(regionRows?.[0]?.count ?? 0),
          sites: accessibleSiteIds.length,
          links: Number(linkRows?.[0]?.count ?? 0),
          services: Number(serviceRows?.[0]?.count ?? 0),
          publishedSites: Number(publishedRows?.[0]?.count ?? 0),
          draftsUpdated24h: Number(drafts24Rows?.[0]?.count ?? 0),
        };

        const regionBreakdown = (regionBreakdownRows || []).map((row) => ({
          id: row.id,
          code: row.code,
          name: row.name,
          siteCount: Number(row.siteCount ?? 0),
          serviceCount: Number(row.serviceCount ?? 0),
        }));

        const recentActivity = (recentDraftRows || []).map((row) => {
          const actor =
            row.firstname || row.lastname
              ? `${row.firstname ?? ""} ${row.lastname ?? ""}`.trim()
              : row.username || "System";
          return {
            siteId: row.siteId,
            siteCode: row.siteCode,
            siteName: row.siteName,
            updatedAt: row.updatedAt,
            actor: actor || "System",
          };
        });

        return res.json({ metrics, regionBreakdown, recentActivity });
      }

      const [
        regionRows,
        siteRows,
        linkRows,
        serviceRows,
        publishedRows,
        drafts24Rows,
        regionBreakdownRows,
        recentDraftRows,
      ] = await Promise.all([
        query("SELECT COUNT(*) AS count FROM region"),
        query("SELECT COUNT(*) AS count FROM site"),
        query("SELECT COUNT(*) AS count FROM link"),
        query("SELECT COUNT(*) AS count FROM siteservice"),
        query("SELECT COUNT(DISTINCT site_id) AS count FROM link"),
        query(
          "SELECT COUNT(*) AS count FROM topologydraft WHERE updated_at >= NOW() - INTERVAL 1 DAY"
        ),
        query(`
          SELECT r.id,
                 r.code,
                 r.name,
                 COUNT(DISTINCT s.id) AS siteCount,
                 COUNT(ss.id) AS serviceCount
            FROM region r
            LEFT JOIN site s ON s.region_id = r.id
            LEFT JOIN siteservice ss ON ss.site_id = s.id
        GROUP BY r.id, r.code, r.name
        ORDER BY r.name
        `),
        query(`
          SELECT td.site_id AS siteId,
                 s.code AS siteCode,
                 s.name AS siteName,
                 td.updated_at AS updatedAt,
                 td.updated_by AS updatedBy,
                 u.firstname,
                 u.lastname,
                 u.username
            FROM topologydraft td
            LEFT JOIN site s ON s.id = td.site_id
            LEFT JOIN users u ON u.id = td.updated_by
        ORDER BY td.updated_at DESC
           LIMIT 6
        `),
      ]);

      const metrics = {
        regions: Number(regionRows?.[0]?.count ?? 0),
        sites: Number(siteRows?.[0]?.count ?? 0),
        links: Number(linkRows?.[0]?.count ?? 0),
        services: Number(serviceRows?.[0]?.count ?? 0),
        publishedSites: Number(publishedRows?.[0]?.count ?? 0),
        draftsUpdated24h: Number(drafts24Rows?.[0]?.count ?? 0),
      };

      const regionBreakdown = (regionBreakdownRows || []).map((row) => ({
        id: row.id,
        code: row.code,
        name: row.name,
        siteCount: Number(row.siteCount ?? 0),
        serviceCount: Number(row.serviceCount ?? 0),
      }));

      const recentActivity = (recentDraftRows || []).map((row) => {
        const actor =
          row.firstname || row.lastname
            ? `${row.firstname ?? ""} ${row.lastname ?? ""}`.trim()
            : row.username || "System";
        return {
          siteId: row.siteId,
          siteCode: row.siteCode,
          siteName: row.siteName,
          updatedAt: row.updatedAt,
          actor: actor || "System",
        };
      });

      res.json({ metrics, regionBreakdown, recentActivity });
    } catch (err) {
      console.error("dashboard overview error:", err);
      res.status(500).json({ message: "dashboard_overview_failed" });
    }
  }
);

/* --------------------------- Admin Topology Routes --------------------------- */

// POST /api/admin/site : create bare site entry
app.post(
  "/api/admin/site",
  authRequired,
  requireRole("admin"),
  async (req, res) => {
    const {
      code,
      name,
      regionCode,
      x = 0,
      y = 0,
      width = 150,
      height = 60,
    } = req.body || {};

    const safeCode = typeof code === "string" ? code.trim().toUpperCase() : "";
    const safeName = typeof name === "string" ? name.trim() : "";
    const safeRegion = typeof regionCode === "string" ? regionCode.trim() : "";

    if (!safeCode || !safeName || !safeRegion) {
      return res.status(400).json({
        message: "code, name, and regionCode are required.",
      });
    }

    try {
      const result = await runInTransaction(async (connQuery) => {
        const [region] = await connQuery(
          "SELECT id FROM region WHERE code = ? LIMIT 1",
          [safeRegion]
        );
        if (!region) {
          const err = new Error("Region not found");
          err.statusCode = 404;
          throw err;
        }

        const [existing] = await connQuery(
          "SELECT id FROM site WHERE code = ? LIMIT 1",
          [safeCode]
        );
        if (existing) {
          const err = new Error("Site code already exists");
          err.statusCode = 409;
          throw err;
        }

        const insert = await connQuery(
          `INSERT INTO site (region_id, code, name, x, y, width, height)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            region.id,
            safeCode,
            safeName,
            Number(x) || 0,
            Number(y) || 0,
            Number(width) || 150,
            Number(height) || 60,
          ]
        );

        return { id: insert.insertId, regionId: region.id };
      });

      res.status(201).json({
        id: result.id,
        code: safeCode,
        name: safeName,
        regionCode: safeRegion,
        x: Number(x) || 0,
        y: Number(y) || 0,
        width: Number(width) || 150,
        height: Number(height) || 60,
      });
    } catch (err) {
      console.error("admin create site error:", err);
      const status = err.statusCode || 500;
      res.status(status).json({ message: err.message || "db_error" });
    }
  }
);

// Ensure supporting table exists:
// CREATE TABLE topologydraft (
//   site_id INT PRIMARY KEY,
//   payload JSON NOT NULL,
//  meta JSON NULL,
//  updated_by INT NULL,
//  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
//  CONSTRAINT fk_topologydraft_site FOREIGN KEY (site_id) REFERENCES site(id) ON DELETE CASCADE
// );

// PUT /api/admin/site/:siteId/topology/draft : upsert draft JSON payload
app.put(
  "/api/admin/site/:siteId/topology/draft",
  authRequired,
  requireRole("site_admin"),
  async (req, res) => {
    const siteId = Number(req.params.siteId);
    const { topology, meta } = req.body || {};
    if (!siteId || !topology) {
      return res
        .status(400)
        .json({ message: "siteId and topology payload are required." });
    }
    if (!(await ensureSiteAccess(req, res, siteId))) return;

    try {
      await query(
        `INSERT INTO topologydraft (site_id, payload, meta, updated_by)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           payload = VALUES(payload),
           meta = VALUES(meta),
           updated_by = VALUES(updated_by),
           updated_at = NOW()`,
        [
          siteId,
          JSON.stringify(topology),
          meta ? JSON.stringify(meta) : null,
          req.user?.sub ?? null,
        ]
      );
      res.json({ ok: true });
    } catch (err) {
      console.error("topology draft upsert error:", err);
      res.status(500).json({ message: "db_error" });
    }
  }
);

// GET /api/admin/site/:siteId/topology/draft : fetch latest draft payload
app.get(
  "/api/admin/site/:siteId/topology/draft",
  authRequired,
  requireRole("site_admin"),
  async (req, res) => {
    const siteId = Number(req.params.siteId);
    if (!siteId) return res.status(400).json({ message: "invalid_site_id" });
    if (!(await ensureSiteAccess(req, res, siteId))) return;

    try {
      const rows = await query(
        `SELECT site_id AS siteId, payload, meta, updated_at AS updatedAt
         FROM topologydraft
         WHERE site_id = ?
         LIMIT 1`,
        [siteId]
      );

      if (!rows.length) return res.json({ draft: null });

      const row = rows[0];
      res.json({
        draft: {
          siteId: row.siteId,
          topology: row.payload ? JSON.parse(row.payload) : null,
          meta: row.meta ? JSON.parse(row.meta) : null,
          updatedAt: row.updatedAt,
        },
      });
    } catch (err) {
      console.error("topology draft fetch error:", err);
      res.status(500).json({ message: "db_error" });
    }
  }
);

// GET /api/admin/site/:siteId/topology/published : latest published topology payload (admin)
app.get(
  "/api/admin/site/:siteId/topology/published",
  authRequired,
  requireRole("site_admin"),
  async (req, res) => {
    const siteId = Number(req.params.siteId);
    if (!siteId) return res.status(400).json({ message: "invalid_site_id" });
    if (!(await ensureSiteAccess(req, res, siteId))) return;

    try {
      const rows = await query(
        `SELECT payload, meta, updated_at AS updatedAt
           FROM topologypublished
          WHERE site_id = ?
          LIMIT 1`,
        [siteId]
      );

      if (!rows.length) return res.json({ topology: null });

      const row = rows[0];
      res.json({
        topology: row.payload ? JSON.parse(row.payload) : null,
        meta: row.meta ? JSON.parse(row.meta) : null,
        updatedAt: row.updatedAt,
      });
    } catch (err) {
      console.error("topology published fetch error:", err);
      res.status(500).json({ message: "db_error" });
    }
  }
);

// GET /api/site/:siteCode/topology/published : public published payload
app.get("/api/site/:siteCode/topology/published", async (req, res) => {
  const siteCode = String(req.params.siteCode || "").trim();
  if (!siteCode) return res.status(400).json({ message: "invalid_site_code" });

  try {
    const rows = await query(
      `SELECT tp.payload, tp.meta, tp.updated_at AS updatedAt
         FROM topologypublished tp
         INNER JOIN site s ON s.id = tp.site_id
        WHERE s.code = ?
        LIMIT 1`,
      [siteCode]
    );

    if (!rows.length) {
      return res.json({ topology: null, meta: null, updatedAt: null });
    }

    const row = rows[0];
    res.json({
      topology: row.payload ? JSON.parse(row.payload) : null,
      meta: row.meta ? JSON.parse(row.meta) : null,
      updatedAt: row.updatedAt,
    });
  } catch (err) {
    console.error("public topology published fetch error:", err);
    res.status(500).json({ message: "db_error" });
  }
});

// PUT /api/admin/site/:siteId/topology/publish : persist topology into main tables
app.put(
  "/api/admin/site/:siteId/topology/publish",
  authRequired,
  requireRole("site_admin"),
  async (req, res) => {
    const siteId = Number(req.params.siteId);
    const { topology, meta } = req.body || {};
    if (
      !siteId ||
      !topology ||
      !Array.isArray(topology.nodes) ||
      !Array.isArray(topology.edges)
    ) {
      return res
        .status(400)
        .json({ message: "siteId and topology (nodes & edges) are required." });
    }
    if (!(await ensureSiteAccess(req, res, siteId))) return;

    try {
      const [site] = await query(
        "SELECT id, code FROM site WHERE id = ? LIMIT 1",
        [siteId]
      );
      if (!site) return res.status(404).json({ message: "site_not_found" });

      const nodes = topology.nodes;
      const edges = topology.edges;

      const nodesById = new Map(
        nodes.map((n) => [
          n.id,
          {
            ...n,
            x: typeof n.x === "number" ? n.x : 0,
            y: typeof n.y === "number" ? n.y : 0,
            width:
              typeof n.width === "number"
                ? n.width
                : typeof n.width === "string"
                ? Number.parseFloat(n.width) || 150
                : 150,
            height:
              typeof n.height === "number"
                ? n.height
                : typeof n.height === "string"
                ? Number.parseFloat(n.height) || 60
                : 60,
          },
        ])
      );

      await runInTransaction(async (txQuery) => {
        // Clear existing topology artefacts for this site
        await txQuery(
          `DELETE linksegment FROM linksegment
             INNER JOIN link ON linksegment.linkid = link.id
            WHERE link.site_id = ?`,
          [siteId]
        );
        await txQuery(
          `DELETE linkload FROM linkload
             INNER JOIN link ON linkload.linkid = link.id
            WHERE link.site_id = ?`,
          [siteId]
        );
        await txQuery("DELETE FROM link WHERE site_id = ?", [siteId]);
        await txQuery("DELETE FROM linklabel WHERE site_id = ?", [siteId]);

        // Update core site dimensions/position if provided
        const coreNode =
          nodes.find((n) => (n.kind || "node") === "core") ||
          nodes.find((n) => n.id === site.code);
        if (coreNode) {
          const entry = nodesById.get(coreNode.id);
          await txQuery(
            `UPDATE site
               SET x = ?,
                   y = ?,
                   width = ?,
                   height = ?,
                   updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [
              Number(entry?.x || 0),
              Number(entry?.y || 0),
              Number(entry?.width || 150),
              Number(entry?.height || 60),
              siteId,
            ]
          );
        }

        // Insert node/label records
        for (const node of nodes) {
          const entry = nodesById.get(node.id);
          if (!entry) continue;
          const kind = typeof node.kind === "string" ? node.kind : "node";
          if (kind === "core") continue;
          const type = kind === "label" ? "label" : "node";
          await txQuery(
            `INSERT INTO linklabel
               (site_id, linkid, node_code, node_name, type, x, y, width, height)
             VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?)`,
            [
              siteId,
              String(node.id || ""),
              typeof node.label === "string" ? node.label : String(node.id || ""),
              type,
              Number(entry.x || 0),
              Number(entry.y || 0),
              Number(entry.width || 150),
              Number(entry.height || 60),
            ]
          );
        }

        // Insert connections
        for (const edge of edges) {
          if (!edge) continue;
          const src = nodesById.get(edge.source);
          const tgt = nodesById.get(edge.target);
          if (!src || !tgt) continue;

          const displayName =
            typeof edge.label === "string" && edge.label.trim()
              ? edge.label.trim()
              : edge.id;

          const insert = await txQuery(
            `INSERT INTO link
               (site_id, linkkey, displayname, fromnode, tonode)
             VALUES (?, ?, ?, ?, ?)` ,
            [
              siteId,
              String(edge.id || `edge-${Date.now()}`),
              displayName,
              String(edge.source || ""),
              String(edge.target || ""),
            ]
          );
          const linkId = insert.insertId;

          if (Array.isArray(edge.loads)) {
            for (const load of edge.loads) {
              if (typeof load !== "string" || !load.trim()) continue;
              await txQuery(
                `INSERT INTO linkload (linkid, loadtag) VALUES (?, ?)`,
                [linkId, load.trim()]
              );
            }
          }

          const sx = Number(src.x || 0) + Number(src.width || 150) / 2;
          const sy = Number(src.y || 0) + Number(src.height || 60) / 2;
          const tx = Number(tgt.x || 0) + Number(tgt.width || 150) / 2;
          const ty = Number(tgt.y || 0) + Number(tgt.height || 60) / 2;
          const path = `M ${sx.toFixed(2)} ${sy.toFixed(
            2
          )} L ${tx.toFixed(2)} ${ty.toFixed(2)}`;

          const meta = JSON.stringify({
            type:
              typeof edge.type === "string" && edge.type
                ? edge.type
                : "smoothstep",
            animated: !!edge.animated,
          });

          await txQuery(
            `INSERT INTO linksegment (linkid, segorder, pathd, description)
             VALUES (?, ?, ?, ?)`,
            [linkId, 0, path, meta]
          );
        }

        // Upsert snapshot into topologydraft for future editing
        await txQuery(
          `INSERT INTO topologydraft (site_id, payload, meta, updated_by)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
               payload = VALUES(payload),
               meta = VALUES(meta),
               updated_by = VALUES(updated_by),
               updated_at = NOW()`,
          [
            siteId,
            JSON.stringify(topology),
            meta ? JSON.stringify(meta) : null,
            req.user?.sub ?? null,
          ]
        );

        await txQuery(
          `INSERT INTO topologypublished (site_id, payload, meta, updated_by)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
               payload = VALUES(payload),
               meta = VALUES(meta),
               updated_by = VALUES(updated_by),
               updated_at = NOW()`,
          [
            siteId,
            JSON.stringify(topology),
            meta ? JSON.stringify(meta) : null,
            req.user?.sub ?? null,
          ]
        );
      });

      res.json({ ok: true });
    } catch (err) {
      console.error("topology publish error:", err);
      res.status(500).json({ message: "db_error" });
    }
  }
);

// DELETE /api/admin/site/:siteId : remove site and related data
app.delete(
  "/api/admin/site/:siteId",
  authRequired,
  requireRole("admin"),
  async (req, res) => {
    const siteId = Number(req.params.siteId);
    if (!Number.isFinite(siteId) || siteId <= 0) {
      return res.status(400).json({ message: "invalid_site_id" });
    }

    const [site] = await query("SELECT id FROM site WHERE id = ? LIMIT 1", [
      siteId,
    ]);
    if (!site) {
      return res.status(404).json({ message: "site_not_found" });
    }

    try {
      await runInTransaction(async (txQuery) => {
        const linkRows = await txQuery(
          "SELECT id FROM link WHERE site_id = ?",
          [siteId]
        );
        if (linkRows.length) {
          const linkIds = linkRows.map((row) => row.id);
          const placeholders = linkIds.map(() => "?").join(",");
          await txQuery(
            `DELETE FROM linksegment WHERE linkid IN (${placeholders})`,
            linkIds
          );
          await txQuery(
            `DELETE FROM linkload WHERE linkid IN (${placeholders})`,
            linkIds
          );
        }

        await txQuery("DELETE FROM linklabel WHERE site_id = ?", [siteId]);
        await txQuery("DELETE FROM staticpath WHERE site_id = ?", [siteId]);
        await txQuery("DELETE FROM siteservice WHERE site_id = ?", [siteId]);
        await txQuery("DELETE FROM topologydraft WHERE site_id = ?", [siteId]);
        await txQuery("DELETE FROM topologypublished WHERE site_id = ?", [
          siteId,
        ]);
        await txQuery("DELETE FROM link WHERE site_id = ?", [siteId]);
        await txQuery("DELETE FROM site_admins WHERE site_id = ?", [siteId]);
        await txQuery("DELETE FROM site WHERE id = ?", [siteId]);
      });

      res.json({ ok: true });
    } catch (err) {
      console.error("site delete error:", err);
      res.status(500).json({ message: "db_error" });
    }
  }
);

/* ----------------------- Admin User Management Routes ---------------------- */

app.get(
  "/api/admin/users",
  authRequired,
  requireRole("admin"),
  async (_req, res) => {
    try {
      const users = await fetchUsersWithSites();
      res.json(users);
    } catch (err) {
      console.error("admin users list error:", err);
      res.status(500).json({ message: "db_error" });
    }
  }
);

app.post(
  "/api/admin/users",
  authRequired,
  requireRole("admin"),
  async (req, res) => {
    const {
      firstname,
      lastname,
      username,
      password,
      siteIds = [],
    } = req.body || {};

    const safeFirstname =
      typeof firstname === "string" ? firstname.trim() : "";
    const safeLastname =
      typeof lastname === "string" ? lastname.trim() : "";
    const safeUsername =
      typeof username === "string" ? username.trim() : "";

    if (!safeUsername) {
      return res.status(400).json({ message: "Username is required." });
    }
    if (!password || password.length < 10) {
      return res.status(400).json({
        message: "Password must be at least 10 characters long.",
      });
    }

    const normalizedSiteIds = Array.isArray(siteIds)
      ? Array.from(
          new Set(
            siteIds
              .map((id) => Number(id))
              .filter((id) => Number.isFinite(id) && id > 0)
          )
        )
      : [];

    if (!normalizedSiteIds.length) {
      return res
        .status(400)
        .json({ message: "Select at least one site for this user." });
    }

    try {
      const hashed = await bcrypt.hash(password, 10);
      const userId = await runInTransaction(async (connQuery) => {
        const [existing] = await connQuery(
          "SELECT id FROM users WHERE LOWER(username) = LOWER(?) LIMIT 1",
          [safeUsername]
        );
        if (existing) {
          const err = new Error("Username is already taken.");
          err.statusCode = 409;
          throw err;
        }

        const insert = await connQuery(
          `INSERT INTO users (firstname, lastname, username, password, role, status, must_change_password)
           VALUES (?, ?, ?, ?, 'site_admin', 'active', 1)` ,
          [safeFirstname, safeLastname, safeUsername, hashed]
        );
        const newUserId = insert.insertId;

        const placeholders = normalizedSiteIds.map(() => "?").join(",");
        const siteRows = await connQuery(
          `SELECT id FROM site WHERE id IN (${placeholders})`,
          normalizedSiteIds
        );
        if (siteRows.length !== normalizedSiteIds.length) {
          const err = new Error("One or more site IDs are invalid.");
          err.statusCode = 400;
          throw err;
        }

        const values = normalizedSiteIds
          .map(() => "(?, ?, ?, ?, NOW(), NULL)")
          .join(",");
        const params = [];
        normalizedSiteIds.forEach((siteId, idx) => {
          params.push(
            siteId,
            newUserId,
            req.user?.sub ?? null,
            idx === 0 ? 1 : 0
          );
        });
        await connQuery(
          `INSERT INTO site_admins (site_id, user_id, assigned_by, is_primary, assigned_at, revoked_at)
           VALUES ${values}
           ON DUPLICATE KEY UPDATE
             revoked_at = NULL,
             assigned_by = VALUES(assigned_by),
             assigned_at = NOW(),
             is_primary = VALUES(is_primary)`,
          params
        );

        return newUserId;
      });

      const created = await fetchUserWithSites(userId);
      res.status(201).json(created);
    } catch (err) {
      console.error("admin create user error:", err);
      const status = err.statusCode || 500;
      res.status(status).json({ message: err.message || "db_error" });
    }
  }
);

app.put(
  "/api/admin/users/:userId",
  authRequired,
  requireRole("admin"),
  async (req, res) => {
    const userId = Number(req.params.userId);
    if (!Number.isFinite(userId) || userId <= 0) {
      return res.status(400).json({ message: "invalid_user_id" });
    }

    const safeFirstname =
      typeof req.body?.firstname === "string" ? req.body.firstname.trim() : "";
    const safeLastname =
      typeof req.body?.lastname === "string" ? req.body.lastname.trim() : "";
    const safeUsername =
      typeof req.body?.username === "string" ? req.body.username.trim() : "";

    if (!safeUsername) {
      return res.status(400).json({ message: "Username is required." });
    }

    try {
      const [existing] = await query(
        "SELECT id FROM users WHERE id = ? LIMIT 1",
        [userId]
      );
      if (!existing) {
        return res.status(404).json({ message: "User not found." });
      }

      const dup = await query(
        "SELECT id FROM users WHERE LOWER(username) = LOWER(?) AND id <> ? LIMIT 1",
        [safeUsername, userId]
      );
      if (dup.length) {
        return res
          .status(409)
          .json({ message: "Username is already taken." });
      }

      await query(
        `UPDATE users
            SET firstname = ?, lastname = ?, username = ?
          WHERE id = ?`,
        [safeFirstname, safeLastname, safeUsername, userId]
      );

      const updated = await fetchUserWithSites(userId);
      res.json(updated);
    } catch (err) {
      console.error("admin update user profile error:", err);
      res.status(500).json({ message: "db_error" });
    }
  }
);

app.put(
  "/api/admin/users/:userId/sites",
  authRequired,
  requireRole("admin"),
  async (req, res) => {
    const userId = Number(req.params.userId);
    if (!Number.isFinite(userId) || userId <= 0) {
      return res.status(400).json({ message: "invalid_user_id" });
    }

    const siteIds = Array.isArray(req.body?.siteIds)
      ? Array.from(
          new Set(
            req.body.siteIds
              .map((id) => Number(id))
              .filter((id) => Number.isFinite(id) && id > 0)
          )
        )
      : [];

    try {
      await runInTransaction(async (connQuery) => {
        const [user] = await connQuery(
          "SELECT id, role FROM users WHERE id = ? LIMIT 1",
          [userId]
        );
        if (!user) {
          const err = new Error("User not found.");
          err.statusCode = 404;
          throw err;
        }
        if (user.role !== "site_admin") {
          const err = new Error(
            "Site assignments are only supported for site admins."
          );
          err.statusCode = 400;
          throw err;
        }

        if (siteIds.length) {
          const placeholders = siteIds.map(() => "?").join(",");
          const siteRows = await connQuery(
            `SELECT id FROM site WHERE id IN (${placeholders})`,
            siteIds
          );
          if (siteRows.length !== siteIds.length) {
            const err = new Error("One or more site IDs are invalid.");
            err.statusCode = 400;
            throw err;
          }
        }

        if (siteIds.length) {
          const placeholders = siteIds.map(() => "?").join(",");
          await connQuery(
            `UPDATE site_admins
                SET revoked_at = NOW()
              WHERE user_id = ?
                AND revoked_at IS NULL
                AND site_id NOT IN (${placeholders})`,
            [userId, ...siteIds]
          );
        } else {
          await connQuery(
            `UPDATE site_admins
                SET revoked_at = NOW()
              WHERE user_id = ?
                AND revoked_at IS NULL`,
            [userId]
          );
        }

        if (siteIds.length) {
          const values = siteIds
            .map(() => "(?, ?, ?, ?, NOW(), NULL)")
            .join(",");
          const params = [];
          siteIds.forEach((siteId, idx) => {
            params.push(siteId, userId, req.user?.sub ?? null, idx === 0 ? 1 : 0);
          });
          await connQuery(
            `INSERT INTO site_admins (site_id, user_id, assigned_by, is_primary, assigned_at, revoked_at)
             VALUES ${values}
             ON DUPLICATE KEY UPDATE
               revoked_at = NULL,
               assigned_by = VALUES(assigned_by),
               assigned_at = NOW(),
               is_primary = VALUES(is_primary)`,
            params
          );
        }
      });

      const updated = await fetchUserWithSites(userId);
      res.json(updated);
    } catch (err) {
      console.error("admin update assignments error:", err);
      const status = err.statusCode || 500;
      res.status(status).json({ message: err.message || "db_error" });
    }
  }
);

// GET /api/admin/load-tags : distinct load tags for reuse
app.get(
  "/api/admin/load-tags",
  authRequired,
  requireRole("site_admin"),
  async (req, res) => {
    try {
      const accessibleSiteIds = await getAccessibleSiteIds(req.user);
      let rows;
      if (Array.isArray(accessibleSiteIds)) {
        if (!accessibleSiteIds.length) {
          rows = [];
        } else {
          const placeholders = accessibleSiteIds.map(() => "?").join(",");
          rows = await query(
            `SELECT DISTINCT ll.loadtag
               FROM linkload ll
               INNER JOIN link l ON l.id = ll.linkid
              WHERE ll.loadtag IS NOT NULL
                AND ll.loadtag <> ''
                AND l.site_id IN (${placeholders})
           ORDER BY ll.loadtag`,
            accessibleSiteIds
          );
        }
      } else {
        rows = await query(
          `SELECT DISTINCT loadtag FROM linkload WHERE loadtag IS NOT NULL AND loadtag <> '' ORDER BY loadtag`
        );
      }
      res.json({
        tags: rows.map((row) => row.loadtag),
      });
    } catch (err) {
      console.error("load tags fetch error:", err);
      res.status(500).json({ message: "db_error" });
    }
  }
);

// POST /api/admin/site/:siteId/service : add a service for a site
app.post(
  "/api/admin/site/:siteId/service",
  authRequired,
  requireRole("site_admin"),
  async (req, res) => {
    const siteId = Number(req.params.siteId);
    const { name, sortOrder } = req.body || {};
    if (!siteId || !Number.isFinite(siteId)) {
      return res.status(400).json({ message: "invalid_site_id" });
    }
    if (!(await ensureSiteAccess(req, res, siteId))) return;
    const trimmedName =
      typeof name === "string" ? name.trim() : "";
    if (!trimmedName) {
      return res
        .status(400)
        .json({ message: "Service name is required." });
    }
    const order =
      typeof sortOrder === "number" && Number.isFinite(sortOrder)
        ? sortOrder
        : typeof sortOrder === "string" && sortOrder.trim()
        ? Number.parseInt(sortOrder, 10) || 0
        : 0;

    try {
      const [site] = await query(
        "SELECT id FROM site WHERE id = ? LIMIT 1",
        [siteId]
      );
      if (!site) {
        return res.status(404).json({ message: "site_not_found" });
      }

      const result = await query(
        `INSERT INTO siteservice (site_id, name, sort_order)
         VALUES (?, ?, ?)`,
        [siteId, trimmedName, order]
      );

      res.status(201).json({
        id: result.insertId,
        siteId,
        name: trimmedName,
        sortOrder: order,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error("site service create error:", err);
      res.status(500).json({ message: "db_error" });
    }
  }
);

// PUT /api/admin/site/:siteId/service/:serviceId : rename/update order
app.put(
  "/api/admin/site/:siteId/service/:serviceId",
  authRequired,
  requireRole("site_admin"),
  async (req, res) => {
    const siteId = Number(req.params.siteId);
    const serviceId = Number(req.params.serviceId);
    const { name, sortOrder } = req.body || {};
    if (!siteId || !Number.isFinite(siteId)) {
      return res.status(400).json({ message: "invalid_site_id" });
    }
    if (!(await ensureSiteAccess(req, res, siteId))) return;
    if (!serviceId || !Number.isFinite(serviceId)) {
      return res.status(400).json({ message: "invalid_service_id" });
    }

    const trimmedName =
      typeof name === "string" ? name.trim() : "";
    const hasName = trimmedName.length > 0;
    const order =
      typeof sortOrder === "number" && Number.isFinite(sortOrder)
        ? sortOrder
        : typeof sortOrder === "string" && sortOrder.trim()
        ? Number.parseInt(sortOrder, 10) || 0
        : undefined;

    if (!hasName && typeof order === "undefined") {
      return res.status(400).json({
        message: "Provide a new name or sortOrder to update the service.",
      });
    }

    try {
      const rows = await query(
        `SELECT id, site_id AS siteId, name, sort_order AS sortOrder
           FROM siteservice
          WHERE id = ?
          LIMIT 1`,
        [serviceId]
      );
      if (!rows.length) {
        return res.status(404).json({ message: "service_not_found" });
      }
      const svc = rows[0];
      if (Number(svc.siteId) !== siteId) {
        return res.status(404).json({ message: "service_not_found" });
      }

      const nextName = hasName ? trimmedName : svc.name;
      const nextOrder =
        typeof order === "number" ? order : Number(svc.sortOrder) || 0;

      await query(
        `UPDATE siteservice
            SET name = ?, sort_order = ?
          WHERE id = ?`,
        [nextName, nextOrder, serviceId]
      );

      res.json({
        id: serviceId,
        siteId,
        name: nextName,
        sortOrder: nextOrder,
      });
    } catch (err) {
      console.error("site service update error:", err);
      res.status(500).json({ message: "db_error" });
    }
  }
);

// DELETE /api/admin/site/:siteId/service/:serviceId : delete service
app.delete(
  "/api/admin/site/:siteId/service/:serviceId",
  authRequired,
  requireRole("site_admin"),
  async (req, res) => {
    const siteId = Number(req.params.siteId);
    const serviceId = Number(req.params.serviceId);
    if (!siteId || !Number.isFinite(siteId)) {
      return res.status(400).json({ message: "invalid_site_id" });
    }
    if (!(await ensureSiteAccess(req, res, siteId))) return;
    if (!serviceId || !Number.isFinite(serviceId)) {
      return res.status(400).json({ message: "invalid_service_id" });
    }

    try {
      const result = await query(
        `DELETE FROM siteservice
          WHERE id = ? AND site_id = ?`,
        [serviceId, siteId]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "service_not_found" });
      }
      res.json({ ok: true });
    } catch (err) {
      console.error("site service delete error:", err);
      res.status(500).json({ message: "db_error" });
    }
  }
);

/* --------------------------------- Start --------------------------------- */
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
