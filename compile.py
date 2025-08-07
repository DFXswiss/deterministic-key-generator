import os
import re
import datetime
import json
from io import open

# This script generates the bip39-standalone.html file.

# It removes script and style tags and replaces with the file content.

f = open('src/index.html', "r", encoding="utf-8")
page = f.read()
f.close()

# Read version from version.json
try:
    with open('version.json', 'r') as vf:
        version_data = json.load(vf)
        version = version_data.get('version', 1)
except:
    version = 1

# Replace version in HTML
page = re.sub(r'<p class="version">v[\d\.]+</p>', f'<p class="version">v{version}</p>', page)


# Script tags

scriptsFinder = re.compile("""<script src="(.*)"></script>""")
scripts = scriptsFinder.findall(page)

for script in scripts:
    filename = os.path.join("src", script)
    s = open(filename, "r", encoding="utf-8")
    scriptContent = "<script>%s</script>" % s.read()
    s.close()
    scriptTag = """<script src="%s"></script>""" % script
    page = page.replace(scriptTag, scriptContent)


# Style tags

stylesFinder = re.compile("""<link rel="stylesheet" href="(.*)">""")
styles = stylesFinder.findall(page)

for style in styles:
    filename = os.path.join("src", style)
    s = open(filename, "r", encoding="utf-8")
    styleContent = "<style>%s</style>" % s.read()
    s.close()
    styleTag = """<link rel="stylesheet" href="%s">""" % style
    page = page.replace(styleTag, styleContent)


# Write the standalone file

f = open('bip39-standalone.html', 'w', encoding="utf-8")
f.write(page)
f.close()

print("%s - DONE" % datetime.datetime.now())
