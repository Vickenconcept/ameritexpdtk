import { useRef } from 'react';
import { Offcanvas, OffcanvasBody, OffcanvasHeader } from "reactstrap"

const Drawer = ({ children, toggle, open, ...props }) => {
  const offcanvasRef = useRef(null);
  return (
    <Offcanvas noderef={offcanvasRef} toggle={toggle} isOpen={open} scrollable={true} direction="end">
      <OffcanvasHeader toggle={toggle}>
        Who is working now?
      </OffcanvasHeader>
      <OffcanvasBody>
        {children}
      </OffcanvasBody>
    </Offcanvas>
  )
}

export default Drawer
