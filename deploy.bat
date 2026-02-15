@echo off
echo Building project...
call npm run build

echo Copying index.html to 404.html for routing...
copy dist\index.html dist\404.html

echo Deploying to gh-pages branch...
git add dist -f
git commit -m "Deploy to GitHub Pages"
git subtree push --prefix dist origin gh-pages

echo Done! Check https://bunnybot1121.github.io/citizen/
