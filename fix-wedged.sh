#!/bin/bash
while true; do
  echo "Running node script..."
  node revert-lucide-fast2.cjs > out.log &
  NODE_PID=$!
  
  LAST_LINE=""
  STUCK_COUNT=0
  
  while kill -0 $NODE_PID 2>/dev/null; do
    CURRENT_LINE=$(tail -n 1 out.log)
    if [ "$CURRENT_LINE" = "$LAST_LINE" ]; then
      STUCK_COUNT=$((STUCK_COUNT + 1))
    else
      STUCK_COUNT=0
      LAST_LINE="$CURRENT_LINE"
    fi
    
    if [ $STUCK_COUNT -ge 3 ]; then
      echo "Stuck detected on: $CURRENT_LINE"
      if [[ $CURRENT_LINE == Checking* ]]; then
        # Use sed to remove "Checking " from the beginning
        FILE=$(echo "$CURRENT_LINE" | sed 's/^Checking //')
        echo "Renaming wedged file '$FILE'..."
        mv "$FILE" "$FILE.locked"
      fi
      kill -9 $NODE_PID
      break
    fi
    sleep 1
  done
  
  # If it exited cleanly
  if ! kill -0 $NODE_PID 2>/dev/null; then
    wait $NODE_PID
    if [ $? -eq 0 ]; then
      echo "Script finished successfully!"
      break
    fi
  fi
done
