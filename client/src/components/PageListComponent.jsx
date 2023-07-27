import { Row, Col, ListGroup, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import API from '../API';
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';


export default function PageList(props) {
    const [users, setUsers] = useState([]);
    let visiblePages = props.pages;
    let navigate = useNavigate();
    
    visiblePages.sort((a, b) => { // when publicationDate is null or draft they are first
        const dateA = dayjs(a.publicationDate);
        const dateB = dayjs(b.publicationDate);
        return dateA - dateB;
    });
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersArray = await API.getAllUsers();
                setUsers(usersArray);
            } catch (err) {
                console.error(err);
            }
        };

        fetchUsers();
    }, []);
    if (!props.loggedIn) {
        visiblePages = props.pages.filter(page => page.publicationDate !== null && dayjs(page.publicationDate) <= dayjs());
    }
    const handleAddClick = () => {
        navigate("/add");
    }
    const handleDeleteClick = async (pageId) => {
        try {
            const blocks = await API.getBlocks(pageId);
            for (const block of blocks) {
                await API.deleteBlock(pageId, block.id);
            }
            await API.deletePage(pageId);
            props.updatePages();
        } catch (err) {
            console.error(err);
        }
    };
    const handleEditClick = (pageId) => {
        navigate(`/edit/${pageId}`);
    }
    
    return (
        <>
            <Row className="my-4">
                <Col>
                    <h1>Welcome to {props.websiteName}!</h1>
                    <p className='lead'>Here is the list of all the pages.</p>
                </Col>
            </Row>
            <Row>
                <Col>
                    <ListGroup variant="flush">
                        {visiblePages.map((p) => <PageRow page={p} key={p.id} user={props.user} users={users} handleDeleteClick={() => handleDeleteClick(p.id)} handleEditClick={()=>handleEditClick(p.id)}/>)}
                        {/* {visiblePages.map((p, index) => <PageRow page={p} key={p.id} index={index+1} />)} to dont show the page id of the db*/}
                    </ListGroup>
                </Col>
            </Row>
            {props.loggedIn &&
                <Row className="my-4 justify-content-end">
                    <Col xs="auto">
                        <Button variant="primary" onClick={handleAddClick}>+</Button>
                    </Col>
                </Row>
            }
        </>
    );
}

function PageRow(props) {
    const [authorName, setAuthorName] = useState('');

    useEffect(() => {
        const author = props.users.find(user => user.id === props.page.authorId);
        setAuthorName(author ? author.username : '');
    }, [props.users, props.page.authorId]);
    
    const getPageStatus = (publicationDate) => {
        if (!publicationDate) {
            return "Draft";
        } else if (dayjs(publicationDate) > dayjs()) {
            return "Scheduled";
        } else {
            return "Published";
        }
    }
    const getFormattedDate = (date) => {
        return dayjs(date).format('D-MMM-YYYY');
    }
    let displayText;
    if(props.page.publicationDate){
        if(dayjs(props.page.publicationDate) > dayjs()){
            displayText = <small>Will be published by <strong>{authorName}</strong> on {getFormattedDate(props.page.publicationDate)}</small>;
        } else {
            displayText = <small>Published by <strong>{authorName}</strong> on {getFormattedDate(props.page.publicationDate)}</small>;
        }
    } else {
        displayText = <small>Still being written by <strong>{authorName}</strong> </small>;
    }
    return (
        <ListGroup.Item>
            <h5>Page: <Link to={`/pages/${props.page.id}`}>{props.page.title}</Link></h5>
            {/*<h5>Page #{props.index}: <Link to={`/pages/${props.page.id}`}>{props.page.title}</Link></h5> to dont show the id on the db of the page */}
            {props.user && (props.user.role === 'admin' || props.user.id === props.page.authorId) &&
                <>
                    <Button variant="danger" onClick={props.handleDeleteClick} style={{ float: 'right' }}><FontAwesomeIcon icon={faTrash} size="1x" /></Button>
                    <Button variant="warning" onClick={props.handleEditClick} style={{ float: 'right', marginRight: '10px' }}><FontAwesomeIcon icon={faPen} size="1x" /></Button>
                </>
            }
            {props.user && <p>Status: <strong>{getPageStatus(props.page.publicationDate)}</strong></p>}
            {/* Display Delete button only if user is admin or the author of the page */}
            
            {displayText}
        </ListGroup.Item>
    );
}
