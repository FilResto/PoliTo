import { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

function ChangeWebsiteName(props) {
  const [show, setShow] = useState(false);
  const [name, setName] = useState('');

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await props.updateWebsiteName(name);
    setName('');
    handleClose();
  };

  return (
    <>
      <Button variant="success" onClick={handleShow}>
        Change Website Name
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Change Website Name</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>{/*called when submit the form */}
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>New Website Name</Form.Label>
              <Form.Control type="text" placeholder="Enter new name" value={name} onChange={e => setName(e.target.value)} required/>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="danger" onClick={handleClose}>
              Close
            </Button>
            <Button variant="success" type="submit">
              Save Changes
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}

export default ChangeWebsiteName;
