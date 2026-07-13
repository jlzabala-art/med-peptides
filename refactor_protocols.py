with open('src/features/protocols/components/ProtocolsTable.jsx', 'r') as f:
    lines = f.readlines()

# Extract lines 790 to 812 (which is 789 to 811 in 0-indexed)
# Wait, let's just find the AnimatePresence blocks instead of relying on exact line numbers.
content = "".join(lines)

# Find the AnimatePresence block for PathwayWizard and CustomBuilder
import re
wizard_pattern = re.compile(r'<AnimatePresence>\s*\{showPathwayWizard.*?</AnimatePresence>\s*<AnimatePresence>\s*\{showCustomBuilder.*?</AnimatePresence>', re.DOTALL)
match = wizard_pattern.search(content)
if match:
    modals_code = match.group(0)
else:
    print("Modals not found!")
    modals_code = ""

# Now, we need to remove lines 42 to 814.
# Let's find "// ── PhaseEditor" and "// ── Responsive CSS"
# Wait, CustomProtocolBuilder is not defined here.
start_idx = content.find('// ── PhaseEditor')
end_idx = content.find('export default function ProtocolsTable')
if end_idx == -1:
    end_idx = content.find('export default function AdminProtocolsTableClient')

if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + "import PhaseEditor from './PhaseEditor';\nimport SupplementsEditor from './SupplementsEditor';\nimport PathwayBuilder from './PathwayBuilder';\n\n" + content[end_idx:]

# Now insert the modals before the final </div> of ProtocolsTable
# The final </div> is before "// ── Responsive CSS"
resp_css_idx = content.find('// ── Responsive CSS')
if resp_css_idx != -1:
    # Find the last </div> before resp_css_idx
    last_div_idx = content.rfind('</div>', 0, resp_css_idx)
    if last_div_idx != -1:
        content = content[:last_div_idx] + "\n" + modals_code + "\n" + content[last_div_idx:]

with open('src/features/protocols/components/ProtocolsTable.jsx', 'w') as f:
    f.write(content)
