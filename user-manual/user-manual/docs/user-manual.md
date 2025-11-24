# CNFM Network WarGames – Friendly User Manual

_Last updated: 2025-11-18_

This guide is written for regular staff. It explains the buttons and the order of steps so you do not have to guess. Keep it open while working.

---

## 1. What the System Does
1. Shows the company network map (cities, labels, fibre lines).
2. Lets approved people draw or edit that map.
3. Shares the latest version with everyone else once you click **Publish**.

---

## 2. Before You Start
1. A coworker already set up the servers. If not, follow the README or ask IT.
2. Make sure both parts are running:
   - API: `node server.js`
   - Web app: `cd frontend && npm run dev`
3. Open your browser and go to `http://localhost:5173`.

If you see an error, check that both commands are still running.

---

## 3. Who Uses Which Screens
| Role | Typical tasks |
| --- | --- |
| Guest | View the published map. |
| Site Admin | Edit the map for their assigned sites, save drafts, publish. |
| Super Admin | Same as Site Admin plus add/remove sites and manage users. |

---

## 4. Basic Navigation
1. **Left sidebar** – Home, Viewer, Login/Admin buttons.
2. **Admin sidebar** – Appears after login. Buttons: Dashboard, Users, Builder, Settings.
3. Pages slide in gently so you know when something changed.

---

## 5. Guest Instructions (Viewer Page)
1. Click **Select Site**.
2. Regions are collapsed at first. Click a region name to show its sites. Only one region stays open to keep things tidy.
3. Click the site name. The published map loads.
4. Hover any link or node to see a short description.
5. Look at the right-hand panel for offline routes and their backup paths.

That’s all a guest can do.

---

## 6. Site Admin Guide – Editing a Topology
Use these steps every time you make changes.

### Step A – Open the Builder and pick a site
1. Log in and go to **Builder** (`/admin/topology`).
2. Press **Select Site** → pick a region → pick the site. Only one region opens at a time.

### Step B – Know the toolbar
- **New Site / Delete Site** – Super admins only.
- **Add Node** – Drops a standard node.
- **Standalone Block** – Drops a label-style block (for headings like “CORE NEs”).
- **Hide Mini Map** – Show or hide the small viewport.
- **Delete Selection** – Removes the selected item.
- **Save Draft** – Saves your work-in-progress.
- **Publish** – Pushes the current drawing to everyone else.

### Step C – Add or rename nodes
1. Click **Add Node** (or **Standalone Block**).
2. Click the new object. The **Inspector** appears on the right.
3. In the **Label** box, type the friendly name (e.g. “MAASIN”).
4. The system remembers this name instantly. Later, when you save or publish, it also uses this name as the node ID in the database.
5. Drag the node to its location. Handles appear around the box.

### Step D – Draw links
1. Grab a handle (small circle) on the node edge.
2. Drag it to another node. A line appears.
3. In the Inspector, fill in the link label and loads if needed.
4. If you drag a link to the wrong spot, simply drag its start or end again. If the drop fails, the system puts it back automatically.

### Step E – Site services
1. Scroll to the **Site Services** card.
2. Type the service name (example: “DWDM Layer 1”).
3. Click **Add Service**. Use the menu (⋮) to edit/delete.

### Step F – Save or Publish
1. **Save Draft** whenever you want to pause. Drafts live in `topologydraft`.
2. **Publish** only when the map looks correct. This writes to the main tables and updates the public viewer.
3. Behind the scenes the system:
   - Makes sure every node has a label.
   - Renames new nodes to that label (adds “-2”, “-3” if names repeat).
   - Updates edges to use those final names.

---

## 7. Super Admin Extras

### Create a brand-new site
1. In the builder, click **New Site**.
2. Enter the site name and pick a region.
3. Click **Create**. A core node with that name is added to the canvas.

### Assign site managers
1. Go to **Users**.
2. To add someone new, click **New Site Admin** and fill out the form.  
   To edit someone, click the three dots → **Edit**.
3. In the edit window:
   - Update first name, last name, and username.
   - Scroll down to the region list. Only one region is open at a time. Tick the sites they should manage.
4. Click **Save changes**.

---

## 8. Publishing Flow at a Glance
```
Draw nodes/links → Save Draft (optional) → Publish → Viewer shows the update
```
- Draft = safe copy for you only.
- Publish = live for everyone else.

---

## 9. Troubleshooting (Plain Language)
| Problem | Try this |
| --- | --- |
| Link vanished after dragging | Usually it snaps back. If not, press **Ctrl + Z** or draw it again. |
| Database still shows `node-xxxx` | Rename the node in the Inspector, then click **Publish** again. |
| I cannot find my site in the picker | You might not have access. Ask a super admin to assign the site to you in **Users**. |
| Modal/window is off to one side | Set the browser zoom to 100% and refresh. |
| Viewer still shows old data | Ensure you clicked **Publish**. Then refresh the Viewer page. |

---

## 10. Need More Help?
- Hover over buttons—most have a tooltip.
- Read the project README for install details.
- Ask the CNFM Network WarGames support or engineering team if something doesn’t work.

Happy mapping!
