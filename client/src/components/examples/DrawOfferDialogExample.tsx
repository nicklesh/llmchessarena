import { useState } from 'react';
import { Button } from '@/components/ui/button';
import DrawOfferDialog from '../DrawOfferDialog';

export default function DrawOfferDialogExample() {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-4">
      <Button onClick={() => setOpen(true)}>Show Draw Dialog</Button>
      <DrawOfferDialog
        open={open}
        offeringPlayer="GPT-4o"
        respondingPlayer="Claude 3.5 Sonnet"
        onAccept={() => { setOpen(false); console.log('Draw accepted'); }}
        onReject={() => { setOpen(false); console.log('Draw rejected'); }}
      />
    </div>
  );
}
