import { useState, useEffect } from 'react';
import { Form, Button, Modal } from 'react-bootstrap';
import API from '../API';
import dayjs from 'dayjs';
import { useNavigate, useParams } from 'react-router-dom';


function AddForm(props) {//for the add
    const navigate = useNavigate();
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');


    // State for page title and blocks
    const [title, setTitle] = useState('');
    const [authorId, setAuthorId] = useState(props.user.id);
    const [publicationDate, setPublicationDate] = useState('');
    const [blocks, setBlocks] = useState([{ type: '', content: '', orders: '' }]);
    const [showModal, setShowModal] = useState(false);
    const [images, setImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const { role } = props.user;
    const [users, setUsers] = useState([]);
    const [creationDate, setCreationDate] = useState(dayjs().format('YYYY-MM-DD'));

    useEffect(() => {
        const fetchUsers = async () => {
            const fetchedUsers = await API.getAllUsers();
            //console.log("fetchedUsers", fetchedUsers)
            setUsers(fetchedUsers);
        };

        fetchUsers();
    }, []);


    // Handlers for title and blocks
    const handleTitleChange = (e) => setTitle(e.target.value);
    const handleAuthorIdChange = (e) => {
        if (role === 'admin') {
            setAuthorId(Number(e.target.value));
        }
    };
    const showErrorModal = (message) => {
        setErrorMessage(message);
        setShowError(true);
    };

    const handlePublicationDateChange = (e) => setPublicationDate(e.target.value);
    const handleBlockTypeChange = (idx) => async (e) => {
        const newBlocks = blocks.map((block, sidx) => {
            if (idx !== sidx) return block;
            return { ...block, type: e.target.value };
        });
        if (e.target.value === 'image') {
            try {
                const images = await API.getImages();
                setImages(images);
                setShowModal(true);
            } catch (err) {
                console.error(err);
            }
        }
        setBlocks(newBlocks);
    };
    const handleBlockContentChange = (idx) => (e) => {
        const newBlocks = blocks.map((block, sidx) => {
            if (idx !== sidx) return block;
            // If the block type is 'image', use the URL of the selected image as the content
            if (block.type === 'image' && selectedImage) {
                return { ...block, content: selectedImage.url };
            }
            return { ...block, content: e.target.value };
        });
        setBlocks(newBlocks);
    };

    const handleBlockOrderChange = (idx) => (e) => {
        const newBlocks = blocks.map((block, sidx) => {
            if (idx !== sidx) return block;
            return { ...block, orders: parseInt(e.target.value) };//cuz in the form everything is treated as string, we need to convert
        });
        setBlocks(newBlocks);
    };

    // Handlers for adding and removing blocks
    const handleAddBlock = () => {
        setBlocks(blocks.concat([{ type: '', content: '', orders: '' }]));
    };
    const handleRemoveBlock = (idx) => () => {
        setBlocks(blocks.filter((block, sidx) => idx !== sidx));
    };

    // Form submission handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Check if the authorId exists in the users list
        const authorExists = users.some(user => user.id === authorId);
        if (!authorExists) {
            showErrorModal('Invalid author ID!');
            return;
        }

        // Check if at least one 'header' type block is present
        const headerExists = blocks.some(block => block.type === 'header');
        if (!headerExists) {
            showErrorModal('You forgot to add an HEADER block!');
            return;
        }
        // Check if at least one 'paragraph' or 'image' type block is present
        const otherBlockExists = blocks.some(block => block.type === 'paragraph' || block.type === 'image');
        if (!otherBlockExists) {
            showErrorModal('You need to add at least one PARAGRAPH or IMAGE block!');
            return;
        }
        // Check if block orders are sequential
        const sortedBlocks = [...blocks].sort((a, b) => a.orders - b.orders);
        for (let i = 0; i < sortedBlocks.length - 1; i++) {
            if (sortedBlocks[i].orders !== sortedBlocks[i + 1].orders - 1) {
                showErrorModal('Block orders must be sequential!');
                return;
            }
        }
        // Check if 'header' and 'paragraph' blocks contain only numbers
        const invalidBlockContent = blocks.some(block => (block.type === 'header' || block.type === 'paragraph') && !isNaN(block.content));
        if (invalidBlockContent) {
            showErrorModal('Content for header and paragraph blocks cannot be just numbers!');
            return;
        }
        // Check if publication date is not before the creation date
        if (publicationDate !== 'draft' && dayjs(publicationDate).isBefore(dayjs(creationDate))) {
            showErrorModal('Publication date cannot be before the creation date!');
            return;
        }

        try {

            const newPage = {
                title: title,
                authorId: authorId,
                creationDate: creationDate,
                publicationDate: publicationDate === 'draft' ? null : publicationDate
            };

            const responsePage = await API.createPage(newPage);
            const pageId = responsePage.id;
            // Sort blocks based on their "orders" value
            const sortedBlocks = [...blocks].sort((a, b) => a.orders - b.orders);
            for (let block of sortedBlocks) {
                // If block type is 'image', we need to fetch the image URL from our array of images
                if (block.type === 'image') {
                    block.content = images.find(image => image.url === block.content).url;
                }

                await API.createBlock(pageId, block);

            }
            props.updatePages();
            // Reset form fields
            setTitle('');
            setBlocks([{ type: '', content: '', orders: '' }]);
            navigate(`/pages/${pageId}`);

        } catch (error) {
            console.error("Failed to create page and blocks", error);
        }

    };


    return (
        <>
            <Form onSubmit={handleSubmit}>
                <Form.Group>
                    <Form.Label style={{ fontSize: '1.15rem', fontWeight: 'bold' }}>Title</Form.Label>
                    <Form.Control
                        type="text"
                        value={title}
                        onChange={handleTitleChange}
                        required={true}
                    />
                </Form.Group>
                <Form.Group controlId='authorId'>
                    <Form.Label style={{ fontSize: '1.15rem', fontWeight: 'bold' }}>Author ID</Form.Label>
                    <Form.Control
                        type="number"
                        placeholder="Author ID"
                        value={authorId}
                        onChange={handleAuthorIdChange}
                        disabled={role !== 'admin'}
                    />

                </Form.Group>
                <Form.Group>
                    <Form.Label style={{ fontSize: '1.15rem', fontWeight: 'bold' }}>Publication Date</Form.Label>
                    <Form.Control
                        type="date"
                        value={publicationDate}
                        onChange={handlePublicationDateChange}
                    />
                </Form.Group>
                {blocks.map((block, idx) => (
                    <div key={idx}>
                        <Form.Group>
                            <Form.Label style={{ fontSize: '1.15rem', fontWeight: 'bold' }}>Block {idx + 1} Type</Form.Label>
                            <Form.Control
                                as="select"
                                value={block.type}
                                onChange={handleBlockTypeChange(idx)}
                                required={true}
                            >
                                <option value="" >Choose...</option>
                                <option value="header">Header</option>
                                <option value="paragraph">Paragraph</option>
                                <option value="image">Image</option>
                            </Form.Control>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label style={{ fontSize: '1.15rem', fontWeight: 'bold' }} >Block {idx + 1} Content</Form.Label>
                            {block.type === 'image' ? (
                                <Form.Control
                                    as="select"
                                    value={block.content}
                                    onChange={handleBlockContentChange(idx)}
                                    required={true}
                                >
                                    <option value="">Choose...</option>
                                    {images.map((image, i) => (
                                        <option key={i} value={image.url}>{image.url}</option>
                                    ))}
                                </Form.Control>
                            ) : (
                                <Form.Control
                                    type="text"
                                    value={block.content}
                                    onChange={handleBlockContentChange(idx)}
                                    required={true}
                                />
                            )}
                        </Form.Group>
                        <Form.Group>
                            <Form.Label style={{ fontSize: '1.15rem', fontWeight: 'bold' }}>Block {idx + 1} Orders</Form.Label>
                            <Form.Control
                                type="number"
                                value={block.orders}
                                onChange={handleBlockOrderChange(idx)}
                                required={true}
                            />
                        </Form.Group>
                        <Button variant="danger" onClick={handleRemoveBlock(idx)}>Remove Block Above</Button>
                    </div>
                ))}
                <div className="d-flex justify-content-between mt-3">
                    <Button variant="primary" onClick={handleAddBlock}>Add Block Under</Button>
                    <Button variant="success" type="submit">Submit</Button>
                    <Button variant="danger" onClick={() => navigate('/')}> Cancel</Button>
                </div>
            </Form>
            <Modal show={showError} onHide={() => setShowError(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Error</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>{errorMessage}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={() => setShowError(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>

    );

}

function EditForm(props) {
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Initialize states
    const navigate = useNavigate();
    const [pageData, setPageData] = useState(null);
    const [blocksData, setBlocksData] = useState([]);
    const { id } = useParams();
    const [title, setTitle] = useState('');
    const [authorId, setAuthorId] = useState('');
    const [publicationDate, setPublicationDate] = useState('');
    const [blocks, setBlocks] = useState([]);
    const { role } = props.user;
    const [images, setImages] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [originalBlocks, setOriginalBlocks] = useState([]);
    const [currentBlocks, setCurrentBlocks] = useState([]);
    const [users, setUsers] = useState([]);
    const [creationDate, setCreationDate] = useState(dayjs().format('YYYY-MM-DD'));

    useEffect(() => {
        const fetchUsers = async () => {
            const fetchedUsers = await API.getAllUsers();
            //console.log("fetchedUsers", fetchedUsers)
            setUsers(fetchedUsers);
        };

        fetchUsers();
    }, []);


    useEffect(() => {
        const getPageData = async () => {
            const page = await API.getPage(id);
            //console.log("page: ",page)
            const blocks = await API.getBlocks(id);
            //console.log("blocks: ",blocks)
            setPageData(page);
            setOriginalBlocks(blocks);
            setCurrentBlocks(JSON.parse(JSON.stringify(blocks))); // Create a deep copy
        };
        getPageData();
    }, [id]);
    // This effect runs when the pageData and blocksData props change.
    // It sets the states to the values of the page and block data.
    useEffect(() => {
        if (pageData) {
            setTitle(pageData.title);
            setAuthorId(pageData.authorId);
            setPublicationDate(pageData.publicationDate ? dayjs(pageData.publicationDate).format('YYYY-MM-DD') : '');
        }
        setBlocks(blocksData);
    }, [pageData, blocksData]);

    useEffect(() => {
        const fetchImages = async () => {
            const fetchedImages = await API.getImages();
            setImages(fetchedImages);
        };
        fetchImages();
    }, []);

    // Handlers for title, authorId, and publicationDate
    const handleTitleChange = (e) => setTitle(e.target.value);
    const handleAuthorIdChange = (e) => {
        if (role === 'admin') {
            setAuthorId(Number(e.target.value));
        }
    };
    const handlePublicationDateChange = (e) => setPublicationDate(e.target.value);
    const showErrorModal = (message) => {
        setErrorMessage(message);
        setShowError(true);
    };

    // Handlers for block type, content, and orders
    const handleBlockTypeChange = (idx) => async (e) => {
        const newBlocks = currentBlocks.map((block, sidx) => {
            if (idx !== sidx) return block;
            return { ...block, type: e.target.value };
        });
        if (e.target.value === 'image') {
            try {
                const images = await API.getImages();
                setImages(images);
                setShowModal(true);
            } catch (err) {
                console.error(err);
            }
        }
        setCurrentBlocks(newBlocks);
    };

    const handleBlockContentChange = (idx) => (e) => {
        const newBlocks = currentBlocks.map((block, sidx) => {
            if (idx !== sidx) return block;
            // If the block type is 'image', use the URL of the selected image as the content
            if (block.type === 'image' && selectedImage) {
                return { ...block, content: selectedImage.url };
            }
            return { ...block, content: e.target.value };
        });

        setCurrentBlocks(newBlocks);
    };

    const handleBlockOrderChange = (idx) => (e) => {
        const newBlocks = currentBlocks.map((block, sidx) => {
            if (idx !== sidx) return block;
            return { ...block, orders: parseInt(e.target.value) };
        });
        setCurrentBlocks(newBlocks);
    };

    // Handlers for adding and removing blocks
    const handleAddBlock = () => {
        setCurrentBlocks(prevBlocks => prevBlocks.concat([{ type: '', content: '', orders: '' }]));
    };
    const handleRemoveBlock = (idx) => () => {
        setCurrentBlocks(prevBlocks => prevBlocks.filter((block, sidx) => idx !== sidx));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();  // This prevents the default form submission behavior which would cause a page refresh.

        // Check if the authorId exists in the users list
        const authorExists = users.some(user => user.id === authorId);
        if (!authorExists) {
            showErrorModal('Invalid author ID!');
            return;
        }

        // Check if at least one 'header' type block is present
        const headerExists = currentBlocks.some(block => block.type === 'header');
        if (!headerExists) {
            showErrorModal('You forgot to add an HEADER block!');
            return;
        }
        // Check if at least one 'paragraph' or 'image' type block is present
        const otherBlockExists = currentBlocks.some(block => block.type === 'paragraph' || block.type === 'image');
        if (!otherBlockExists) {
            showErrorModal('You need to add at least one PARAGRAPH or IMAGE block!');
            return;
        }
        // Check if block orders are sequential
        const sortedBlocks = [...currentBlocks].sort((a, b) => a.orders - b.orders);
        for (let i = 0; i < sortedBlocks.length - 1; i++) {
            if (sortedBlocks[i].orders !== sortedBlocks[i + 1].orders - 1) {
                showErrorModal('Block orders must be sequential!');
                return;
            }
        }
        // Check if 'header' and 'paragraph' blocks contain only numbers
        const invalidBlockContent = currentBlocks.some(block => (block.type === 'header' || block.type === 'paragraph') && !isNaN(block.content));
        if (invalidBlockContent) {
            showErrorModal('Content for header and paragraph blocks cannot be just numbers!');
            return;
        }
        // Check if publication date is not before the creation date
        if (publicationDate !== 'draft' && dayjs(publicationDate).isBefore(dayjs(creationDate))) {
            showErrorModal('Publication date cannot be before the creation date!');
            return;
        }
        // Prepare page data.
        const updatedPage = {
            title: title,
            authorId: authorId,
            creationDate: creationDate,
            publicationDate: publicationDate || null  // If publicationDate is an empty string, set it to null.
        };

        // Call the API method to update the page.
        try {
            //here we update the page
            await API.updatePage(id, updatedPage);
            // Find blocks that were removed and delete them
            for (const block of originalBlocks) {
                if (!currentBlocks.some(currentBlock => currentBlock.id === block.id)) {
                    await API.deleteBlock(id, block.id);
                }
            }
            // Sort blocks based on their "orders" value
            const sortedBlocks = [...currentBlocks].sort((a, b) => a.orders - b.orders);
            // Find blocks that were added or updated
            for (let block of sortedBlocks) {
                if (!block.id) {
                    // This is a new block, so create it
                    await API.createBlock(id, block);
                } else {
                    // This is an existing block, so update it
                    await API.updateBlock(id, block.id, block);
                }
            }
            // After everything has been successfully updated, we may want to redirect the user back to the view page.
            props.updatePages();
            navigate(`/pages/${id}`);
        } catch (err) {
            console.error('Failed to update page:', err);
            // Display an error message to the user.
        }
    };


    return (
        <>
            <Form onSubmit={handleSubmit}>
                {/* Page fields... */}
                <Form.Group controlId="formTitle">
                    <Form.Label style={{ fontSize: '1.15rem', fontWeight: 'bold' }}>Title</Form.Label>
                    <Form.Control
                        type="text"
                        value={title}
                        onChange={handleTitleChange}
                        required={true}
                    />
                </Form.Group>
                <Form.Group controlId="formAuthorId">
                    <Form.Label style={{ fontSize: '1.15rem', fontWeight: 'bold' }}>Author ID</Form.Label>
                    <Form.Control
                        type="number"
                        placeholder="Author ID"
                        value={authorId}
                        onChange={handleAuthorIdChange}
                        disabled={role !== 'admin'}
                    />
                </Form.Group>
                <Form.Group controlId="formPublicationDate">
                    <Form.Label style={{ fontSize: '1.15rem', fontWeight: 'bold' }}>Publication Date</Form.Label>
                    <Form.Control
                        type="date"
                        value={publicationDate}
                        onChange={handlePublicationDateChange}
                    />
                </Form.Group>
                {currentBlocks.map((block, idx) => (
                    <div key={idx}>
                        <Form.Group>
                            <Form.Label style={{ fontSize: '1.15rem', fontWeight: 'bold' }}>Block {idx + 1} Type</Form.Label>
                            <Form.Control
                                as="select"
                                value={block.type}
                                onChange={handleBlockTypeChange(idx)}
                                required={true}
                            >
                                <option value="" >Choose...</option>
                                <option value="header">Header</option>
                                <option value="paragraph">Paragraph</option>
                                <option value="image">Image</option>
                            </Form.Control>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label style={{ fontSize: '1.15rem', fontWeight: 'bold' }} >Block {idx + 1} Content</Form.Label>
                            {block.type === 'image' ? (
                                <Form.Control
                                    as="select"
                                    value={block.content}
                                    onChange={handleBlockContentChange(idx)}
                                    required={true}
                                >
                                    <option value="">Choose...</option>
                                    {images.map((image, i) => (
                                        <option key={i} value={image.url}>{image.url}</option>
                                    ))}
                                </Form.Control>
                            ) : (
                                <Form.Control
                                    type="text"
                                    value={block.content}
                                    onChange={handleBlockContentChange(idx)}
                                    required={true}
                                />
                            )}
                        </Form.Group>
                        <Form.Group>
                            <Form.Label style={{ fontSize: '1.15rem', fontWeight: 'bold' }}>Block {idx + 1} Orders</Form.Label>
                            <Form.Control
                                type="number"
                                value={block.orders}
                                onChange={handleBlockOrderChange(idx)}
                                required={true}
                            />
                        </Form.Group>
                        <Button variant="danger" onClick={handleRemoveBlock(idx)}>Remove Block Above</Button>
                    </div>
                ))}
                <div className="d-flex justify-content-between mt-3">
                    <Button variant="primary" onClick={handleAddBlock}>Add Block Under</Button>
                    <Button variant="success" type="submit">Submit</Button>
                    <Button variant="danger" onClick={() => navigate('/')}> Cancel</Button>
                </div>
            </Form>
            <Modal show={showError} onHide={() => setShowError(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Error</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>{errorMessage}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={() => setShowError(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );

}


export { AddForm, EditForm };