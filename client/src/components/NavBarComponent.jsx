import { Navbar, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { LogoutButton } from './AuthComponent';
import ChangeWebsiteName from './ChangeWebsiteForm';

function NavHeader(props) {
    return (
        <Navbar bg="primary" variant='dark'>
            <Container fluid>
                <Link to='/' className='navbar-brand'>{props.websiteName}</Link>
                {
                    props.loggedIn === true ?
                        (props.user?.role === 'admin' ? <ChangeWebsiteName updateWebsiteName={props.updateWebsiteName} /> : null)
                        : null
                }

                {props.loggedIn ? //if im logged in i want to see the logout button and viceversa
                    <LogoutButton logout={props.handleLogout} /> ://for logout we just need to call a function in orders to destruct the cookie
                    <Link to='/login' className='btn btn-outline-light'>Login</Link>//login is a link cuz we need to call a route to another page
                }
            </Container>
        </Navbar>


    );
}
export default NavHeader;