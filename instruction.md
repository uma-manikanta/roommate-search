# Overleaf Integration Instructions

To successfully compile your Roommate Finder project report on Overleaf with the generated architecture diagrams, follow these steps:

### Step 1: Upload the `.tex` file
1. Open your Overleaf project (or create a new blank project).
2. Click the **Upload** button (usually at the top left above the file tree).
3. Upload the `project_report_today.tex` file from your local machine.

### Step 2: Upload the Diagrams
1. In your Overleaf project, create a new folder named exactly **`diagrams`**.
    * *Note: You can do this by clicking the "New Folder" icon in the top left corner of the file tree.*
2. Select the newly created `diagrams` folder.
3. Click the **Upload** button.
4. Upload all the `.png` files generated in your local `diagrams` folder:
    * `system_architecture.png`
    * `db_schema.png`
    * `auth_flow.png`
    * `matching_algo.png`

### Step 3: Recompile the Document
1. Select `project_report_today.tex` so it opens in the editor.
2. Ensure you have set the main document to this file if it wasn't done automatically.
3. Click the green **Recompile** button.

The LaTeX compiler will now automatically fetch the images from the `diagrams` folder and render them in their respective places within the report!
