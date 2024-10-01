import { FC } from 'react';

export const ClickableComponent: FC<{
  closePortal: () => void;
  openPortal: () => void;
  open: any;
}> = ({ open, closePortal, openPortal }) => {
  return (
    <>
      <div>
        <button
          onClick={() => {
            open ? closePortal() : openPortal();
          }}
        >
          {open === true ? 'Close' : 'Open'}
        </button>
      </div>
    </>
  );
};
