#!/usr/bin/env python3
import json
import os

# Get the directory of this script
script_dir = os.path.dirname(os.path.abspath(__file__))
version_file = os.path.join(script_dir, 'version.json')

# Read current version
with open(version_file, 'r') as f:
    data = json.load(f)

# Increment version
data['version'] += 1

# Write new version
with open(version_file, 'w') as f:
    json.dump(data, f, indent=2)

print(f"Version incremented to {data['version']}")