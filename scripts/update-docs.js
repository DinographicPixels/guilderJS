const fs = require("fs");
const path = require("path");

const copyFolderSync = (source, destination) => {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

  const items = fs.readdirSync(source);
  for (const item of items) {
    const sourcePath = path.join(source, item);
    const destinationPath = path.join(destination, item);

    if (fs.lstatSync(sourcePath).isDirectory()) {
      copyFolderSync(sourcePath, destinationPath);
    } else {
      fs.copyFileSync(sourcePath, destinationPath);
    }
  }
};

const currentDir = __dirname;
const sourceFolder = path.join(currentDir, "../docs");
const destinationFolder = path.join(currentDir, "../../TouchGuild-GenDocs/dev");

copyFolderSync(sourceFolder, destinationFolder);
copyFolderSync(
  path.join(currentDir, "../../TouchGuild-GenDocs/docstyles"),
  path.join(destinationFolder, "./assets/")
);

console.log("Successfully updated developer documentation.");
