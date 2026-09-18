import { useEffect, useRef } from 'react';
import { Icon } from './Icon';

export function ResetDialog({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog ref={dialogRef} className="reset-dialog" aria-labelledby="reset-title" aria-describedby="reset-description" onCancel={onClose} onClose={onClose}>
      <button className="dialog-close" type="button" onClick={onClose} aria-label="Fermer"><Icon name="close" /></button>
      <Icon name="reset" size={22} />
      <h2 id="reset-title">Repartir de zéro ?</h2>
      <p id="reset-description">Tous vos pronostics seront effacés, y compris votre champion.</p>
      <div className="dialog-actions">
        <button className="button-secondary" type="button" onClick={onClose} autoFocus>Conserver mes choix</button>
        <button className="button-confirm" type="button" onClick={onConfirm}>Tout réinitialiser</button>
      </div>
    </dialog>
  );
}
