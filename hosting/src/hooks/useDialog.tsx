import React, { useState } from 'react';
import Dialog from '@material-ui/core/Dialog/Dialog';

let resolvePromise: (data: any) => void;
let rejectPromise: () => void;

export default function useDialog<T>(DialogContent: any, fullScreen: boolean) {
  const [open, setOpen] = useState(false);
  const [dialogProps, setDialogProps] = useState({});

  const openDialog = (props: { [key: string]: any }): Promise<T> => {
    return new Promise<T>((resolve, reject) => {
      resolvePromise = resolve;
      rejectPromise = reject;
      setDialogProps(props);
      setOpen(true);
    });
  };

  const handleDecline = () => {
    rejectPromise();
    setOpen(false);
  };

  const handleAccept = (data: T) => {
    resolvePromise(data);
    setOpen(false);
  };

  const handleClose = () => {
    rejectPromise();
    setOpen(false);
  };

  const component = (
    <Dialog fullScreen={fullScreen} open={open} onClose={handleClose}>
      <DialogContent {...dialogProps} onAccept={handleAccept} onDecline={handleDecline} />
    </Dialog>
  );

  return { open: openDialog, component };
}
