# Exporting the User Manual

Because this environment blocks npm downloads, the PDF is not generated automatically. When you have internet access, run the following from the project root:

```bash
cd user-manual/user-manual/docs
npx --yes md-to-pdf user-manual.md
```

This will create `user-manual.pdf` in the same directory. You can then copy it into the `docs` folder or share it externally.

If you prefer another tool, Pandoc works as well:

```bash
pandoc user-manual.md -o user-manual.pdf --from markdown --toc --metadata title="CNFM Network WarGames Manual"
```

> Tip: Add any screenshots from the `screenshots/` folder to the PDF using your favourite editor if needed.
