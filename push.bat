@echo off
cd /d d:\isef
git add -A
git commit -m "fix(dock): perfect containment of icons inside frosted glass pill dock"
git push origin main
del push.bat
