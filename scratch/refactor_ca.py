import sys

def refactor():
    path = '/Users/joseluiszabala/Documents/Antigravity/regenpept-web/src/components/shared/ClinicalAssistant.jsx'
    with open(path, 'r') as f:
        content = f.read()

    # Find the start of the chat window
    start_marker = '{/* Chat Window */}'
    start_idx = content.find(start_marker)
    if start_idx == -1:
        print("Could not find start marker")
        return

    # Find AnimatePresence start
    ap_start = content.find('<AnimatePresence>', start_idx)
    # Find AnimatePresence end
    # Note: there might be multiple AnimatePresence. We want the one that starts after start_marker
    # and ends before WhatsApp Support Escalation Card
    end_marker = '{/* WhatsApp Support Escalation Card */}'
    end_idx = content.find(end_marker)
    
    if ap_start == -1 or end_idx == -1:
        print("Could not find boundaries")
        return

    ap_end = content.rfind('</AnimatePresence>', ap_start, end_idx) + len('</AnimatePresence>')

    original_ap_block = content[ap_start:ap_end]
    
    # Extract the internal content of the motion.div
    # It starts after the first <motion.div ...> and ends before the matching </motion.div>
    motion_div_start = content.find('<motion.div', ap_start, ap_end)
    motion_div_tag_end = content.find('>', motion_div_start) + 1
    motion_div_end = content.rfind('</motion.div>', ap_start, ap_end)
    
    inner_content = content[motion_div_tag_end:motion_div_end].strip()

    # Create the new block
    new_block = """
      {/* Chat Window Implementation */}
      {(() => {
        const renderChatContent = () => (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            """ + inner_content + """
          </div>
        );

        return isMobile ? (
          <BottomSheet 
            isOpen={isOpen} 
            onClose={() => setIsOpen(false)}
            title="Med-Peptides Clinical AI"
          >
            {renderChatContent()}
          </BottomSheet>
        ) : (
          <AnimatePresence>
            {isOpen && (
              <motion.div
                className="ca-chat-mobile"
                initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: 'bottom left' }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                style={{
                  position: 'fixed',
                  bottom: '6.5rem',
                  left: '2rem',
                  width: '520px',
                  maxWidth: 'calc(100vw - 4rem)',
                  height: '660px',
                  maxHeight: 'calc(100vh - 10rem)',
                  backgroundColor: 'white',
                  borderRadius: '28px',
                  boxShadow: '0 24px 64px rgba(0,0,0,0.15)',
                  display: 'flex',
                  flexDirection: 'column',
                  zIndex: 9998,
                  overflow: 'hidden',
                  border: '1px solid rgba(0,0,0,0.05)'
                }}
              >
                {renderChatContent()}
              </motion.div>
            )}
          </AnimatePresence>
        );
      })()}
"""
    
    new_content = content[:ap_start] + new_block + content[ap_end:]
    
    with open(path, 'w') as f:
        f.write(new_content)
    print("Successfully refactored ClinicalAssistant.jsx")

if __name__ == "__main__":
    refactor()
