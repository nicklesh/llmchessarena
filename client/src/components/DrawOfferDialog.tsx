import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DrawOfferDialogProps {
  open: boolean;
  offeringPlayer: string;
  respondingPlayer: string;
  onAccept: () => void;
  onReject: () => void;
}

export default function DrawOfferDialog({
  open,
  offeringPlayer,
  respondingPlayer,
  onAccept,
  onReject,
}: DrawOfferDialogProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Draw Offered</AlertDialogTitle>
          <AlertDialogDescription>
            <span className="font-semibold">{offeringPlayer}</span> is offering a draw.
            <br />
            <span className="font-semibold">{respondingPlayer}</span>, do you accept?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onReject} data-testid="button-reject-draw">
            Reject
          </AlertDialogCancel>
          <AlertDialogAction onClick={onAccept} data-testid="button-accept-draw">
            Accept Draw
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
