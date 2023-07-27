import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import API from '../API';
import { Row, Col, Spinner, Container, Alert, Button } from 'react-bootstrap';
import dayjs from 'dayjs';
import { HeaderBlock, ImageBlock, ParagraphBlock } from './BlockComponent';

function SinglePageComponent (props) {
    const { id } = useParams();
    const [page, setPage] = useState(null);
    const [blocks, setBlocks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [redirectToLogin, setRedirectToLogin] = useState(false); // Declare this state here
    const navigate = useNavigate();

    useEffect(() => {
        if (redirectToLogin) {
            // Navigate to login
            <Navigate replace to='login' />
            
        }
    }, [redirectToLogin]);
    useEffect(() => {
        const fetchPageAndBlocks = async () => {
            try {
                setLoading(true);
                const fetchedPage = await API.getPage(id);

                // If the user is not logged in and the page is not published,
                // set redirectToLogin to true
                if (!props.loggedIn &&
                    (!fetchedPage.publicationDate || dayjs(fetchedPage.publicationDate).isAfter(dayjs()))) {
                    setLoading(false);
                    console.log('User is not logged in and page is not published'); // Add this line
                    setRedirectToLogin(true); // Update this line
                    return;
                }

                setPage(fetchedPage);
                const fetchedBlocks = await API.getBlocks(id);
                setBlocks(fetchedBlocks);
                setLoading(false);
            } catch (error) {
                console.log(error);
                if (error.message === "Page not found") {
                    setPage(null);  // If the page does not exist, set page to null
                }
                setBlocks([]);
                setLoading(false);
            } finally {
                setLoading(false);
            }
        };
        fetchPageAndBlocks();
    }, [id, props.loggedIn]);


    if (loading) {
        return <Spinner animation="grow" />;
    }
    // If page data is still being fetched, return null
    /*if (!page) {
        return null;
    }*/

    return (
        <Container className="my-4">
            {page ?
                <>
                    <PageDescription page={page} loggedIn={props.loggedIn} />
                    {blocks.map((block, index) => {
                        switch (block.type) {
                            case 'header':
                                return <HeaderBlock key={index} content={block.content} />
                            case 'paragraph':
                                return <ParagraphBlock key={index} content={block.content} />
                            case 'image':
                                return <ImageBlock key={index} content={block.content} />
                            default:
                                return null;
                        }
                    })}
                </>
                :
                <Alert variant="danger" className='lead text-center'>The selected page does not exist! Please select a different page from the list.</Alert>
            }
            <Button variant="primary" onClick={() => navigate('/')}> Back </Button>
        </Container>
    );

}

function PageDescription(props) {
    let status;
    if (!props.page.publicationDate) {
        status = "Draft";
    } else if (dayjs(props.page.publicationDate).isAfter(dayjs())) {
        status = "Scheduled";
    } else {
        status = "Published";
    }
    return (
        <>
            <Row>
                <PageHeader pageId={props.page.id} creationDate={props.page.creationDate} author={props.page.authorId} publicationDate={props.page.publicationDate} status={status} loggedIn={props.loggedIn} />
            </Row>
            <Row>
                <PageText title={props.page.title} />
            </Row>
        </>

    );
}

function PageHeader(props) {
    const [authorName, setAuthorName] = useState('');

    useEffect(() => {
        const fetchAuthorName = async () => {
            try {
                const user = await API.getUserById(props.author);
                setAuthorName(user.username);
            } catch (err) {
                console.error(err);
            }
        };
        fetchAuthorName();
    }, [props.author]);
    return (
        <Col md={12}>
            <h2>
                <strong>Page</strong>
            </h2>
            <p className="float-end text-small">Made by <span className="badge rounded-pill text-bg-secondary text-end">{authorName}</span></p>
            {props.loggedIn && <p className="text-small"><strong>Created on:</strong> {dayjs(props.creationDate).format('D-MMM-YYYY')}</p>}
            {
                props.publicationDate && (
                    <p className="text-small">
                        <strong>
                            {
                                dayjs(props.publicationDate).isAfter(dayjs()) ?
                                    'Will be published on: ' :
                                    'Published on: '
                            }
                        </strong>
                        {dayjs(props.publicationDate).format('D-MMM-YYYY')}
                    </p>
                )
            }
            {props.loggedIn && <p className="text-small"><strong>Status:</strong> {props.status}</p>}

            

        </Col>
    );
}

function PageText(props) {
    return (
        <Col md={12} className="text-center">
            <h1 className="display-1 text-uppercase py-3" style={{ color: 'purple', fontWeight: 'bold', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' }}>{props.title}</h1>

        </Col>
    );
}


export default SinglePageComponent;
