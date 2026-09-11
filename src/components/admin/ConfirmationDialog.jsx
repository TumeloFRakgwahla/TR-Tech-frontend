import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '../ui/dialog';
import { Button } from '../ui/button';

export function ConfirmationDialog({
  trigger,
  title = 'Are you sure?',
  description = '',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'destructive',
  onConfirm,
  open,
  onOpenChange,
}) {
  if (open !== undefined && onOpenChange) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">{title}</DialogTitle>
            {description && (
              <p className="text-sm text-slate-300 mt-2">{description}</p>
            )}
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="border-slate-600 text-white hover:bg-slate-700">
              {cancelLabel}
            </Button>
            <Button
              variant={confirmVariant}
              onClick={() => {
                onConfirm?.();
                onOpenChange(false);
              }}
              className={confirmVariant === 'destructive' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}
            >
              {confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="bg-slate-800 border-slate-700 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">{title}</DialogTitle>
          {description && (
            <p className="text-sm text-slate-300 mt-2">{description}</p>
          )}
        </DialogHeader>
        <DialogFooter>
          <DialogTrigger asChild>
            <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
              {cancelLabel}
            </Button>
          </DialogTrigger>
          <Button
            variant={confirmVariant}
            onClick={onConfirm}
            className={confirmVariant === 'destructive' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
