import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Alert, Spinner } from 'react-bootstrap';
import API from './API';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import NavHeader from './components/NavBarComponent';
import PageList from './components/PageListComponent';
import { LoginForm } from './components/AuthComponent'
import NotFound from './components/NotFoundComponent';
import SinglePageComponent from './components/SinglePageComponent';
import { AddForm, EditForm } from './components/PageForm';

function App() {
  const [pages, setPages] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [message, setMessage] = useState('');
  const [websiteName, setWebsiteName] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setloading] = useState(false);


  useEffect(() => {//we will get an error in the console as error 401 unouthorized cuz the user at the start is not authorized
    const checkAuth = async () => {
      try {
        const userInfo = await API.getUserInfo(); // Assign the result to userInfo
        //console.log(userInfo); // Log userInfo
        setUser(userInfo); // Update state with userInfo
        setLoggedIn(true);
        //setUserRoleLoaded(true);
      } catch (err) {
        setUser(null);
        setLoggedIn(false);
        //setUserRoleLoaded(false);
      }
    };
    checkAuth();
  }, [loggedIn]);

  useEffect(() => {
    //get all the pages from the API
    const getPages = async () => {
      const pages = await API.getPages();
      setPages(pages);
    }
    getPages();
  }, []);

  const updatePages = async () => {//for updating the pages when a page is deleted or added
    const updatedPages = await API.getPages();
    setPages(updatedPages);
  };


  useEffect(() => {
    const fetchWebsiteName = async () => {
      setloading(true);
      try {
        const website = await API.getWebsiteName();
        setWebsiteName(website.name);
      } catch (err) {
        console.error(err);
        setloading(false);
      }finally {
        setloading(false);
      }
    };
    fetchWebsiteName();
  }, []);

  const handleLogin = async (credentials) => {
    try {
      const user = await API.logIn(credentials);
      setLoggedIn(true);
      setMessage({ msg: `Welcome, ${user.username}!`, type: 'success' });
      //console.log(user);
    } catch (err) {
      setMessage({ msg: err, type: 'danger' });
    }
  };

  const handleLogout = async () => {
    await API.logOut();
    setLoggedIn(false);
    // clean up everything
    setMessage('');
  };
  const handleUpdateWebsiteName = async (newName) => {
    try {
      await API.updateWebsiteName(newName);
      setWebsiteName(newName);
    } catch (err) {
      console.error(err);
    }
  };
  if (loading) {
    return <Spinner animation="border"role="status" />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={
          <>
            <NavHeader pages={pages} loggedIn={loggedIn} handleLogout={handleLogout} websiteName={websiteName} updateWebsiteName={handleUpdateWebsiteName} user={user} />
            <Container fluid className="mt-3">
              {message && <Row>
                <Alert variant={message.type} onClose={() => setMessage('')} dismissible>{message.msg}</Alert>
              </Row>}
              <Outlet />
            </Container>
          </>} >
          <Route index element={<PageList pages={pages} websiteName={websiteName} loggedIn={loggedIn} updatePages={updatePages} user={user} />} />
          <Route path='pages/:id' element={<SinglePageComponent pages={pages} loggedIn={loggedIn} />} />
          <Route path='add' element={loggedIn ? <AddForm user={user} updatePages={updatePages} /> : <Navigate replace to='/' />} />
          <Route path='edit/:id' element={loggedIn ? <EditForm user={user} updatePages={updatePages} /> : <Navigate replace to='/' />} />
          <Route path='*' element={<NotFound />} />
          <Route path="login" element={!loggedIn ? <LoginForm login={handleLogin} /> : <Navigate replace to='/' />} />

        </Route>
      </Routes>
    </BrowserRouter>
  )
}
export default App;