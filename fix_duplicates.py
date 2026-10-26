#!/usr/bin/env python3
"""Fix duplicate properties in translations.ts"""

with open('/root/ClubeMkt/mimenu/src/i18n/translations.ts', 'r') as f:
    lines = f.readlines()

print(f"Original file: {len(lines)} lines")

# Track which lines to remove
lines_to_remove = []

# Spanish section duplicates:
# Line 153: featuresLead "Un ecosistema completo..."
# Line 331: footerTagline "Tecnología para restaurantes, bares y deliveries."
lines_to_remove.extend([152, 330])  # 0-indexed

# English section duplicates:
# Lines 487-500: duplicate block (featuresTitle, featuresLead, f1-f6)
# Line 679: footerTagline "Technology for restaurants, bars and deliveries."
# But we need to be careful - after removing Spanish lines, these shift
# Let's handle it differently - remove the BLOCK in English

# First pass: remove all duplicates
indices_to_remove = set()

# Spanish duplicates
indices_to_remove.add(152)  # featuresLead duplicate
indices_to_remove.add(330)  # footerTagline duplicate

# English duplicates (these are the blocks after the first occurrence of f6Desc)
# The structure is: 
# Line 474: featuresLead
# Lines 475-486: f1-f6
# Line 487: featuresTitle (FIRST occurrence in English - NOT duplicate!)
# Line 488: featuresLead (DUPLICATE)
# Lines 489-500: f1-f6 (DUPLICATE)

# Actually, looking at the code again:
# Line 474: featuresLead
# Lines 475-486: f1Title-f6Desc
# Line 487: featuresTitle
# Line 488: featuresLead (DUPLICATE of 474)
# Lines 489-500: f1Title-f6Desc (DUPLICATE of 475-486)

# So in English, we need to remove lines 488-500 (the duplicate block)
# But wait - line 487 featuresTitle is NOT a duplicate - only 488-500 are

# Portuguese duplicates:
# Line 836: featuresLead (after featuresTitle)
# Line 1014: footerTagline

# Let me recalculate after sorting
# The correct approach: identify duplicates by NAME, not line number

# Let me do a smarter approach: track property names and find duplicates
properties_seen = {}  # name -> first_line_number
duplicates = set()

for i, line in enumerate(lines, 1):
    stripped = line.strip()
    if ':' in stripped and not stripped.startswith('//') and not stripped.startswith('['):
        # Extract property name (handle quoted and unquoted)
        parts = stripped.split(':', 1)
        if len(parts) == 2:
            prop_name = parts[0].strip().strip('"').strip("'")
            if prop_name in properties_seen:
                # This is a duplicate
                duplicates.add(i - 1)  # 0-indexed
            else:
                properties_seen[prop_name] = i

print(f"Found {len(duplicates)} duplicate property lines:")
for d in sorted(duplicates):
    print(f"  Line {d+1}: {lines[d].strip()}")

# Remove duplicates in reverse order
for line_num in sorted(duplicates, reverse=True):
    if 0 <= line_num < len(lines):
        del lines[line_num]

print(f"\nAfter removing duplicates: {len(lines)} lines")

# Now fix the Spanish hero text
for i, line in enumerate(lines):
    if '"Sistema para Restaurante:"' in line and 'heroTitle' in line:
        print(f"Fixing Spanish heroTitle at line {i+1}")
        lines[i] = line.replace('"Sistema para Restaurante:"', '"Tecnología completa"')

# Also fix the heroAccent/heroTail for cleaner display
for i, line in enumerate(lines):
    if i < len(lines) and '"la tecnología completa"' in lines[i]:
        lines[i] = lines[i].replace('"la tecnología completa"', '"que cuida de tu gestión"')
        if i+1 < len(lines) and 'heroTail' in lines[i+1]:
            lines[i+1] = lines[i+1].replace('"que cuida de tu gestión"', '""')
        break

with open('/root/ClubeMkt/mimenu/src/i18n/translations.ts', 'w') as f:
    f.writelines(lines)

print("Done!")