import { Page, Block, Image, Website } from "./PageBlockWebModel";
const SERVER_URL = 'http://localhost:3001';

/*---------------------------------------------PAGES--------------------------------------------- */

const getPages = async () => {
    const response = await fetch(`${SERVER_URL}/api/pages`);
    if (response.ok) {
        const pagesJson = await response.json();
        return pagesJson.map(p => new Page(p.id, p.title, p.authorId, p.creationDate, p.publicationDate));
    }
    else
        throw new Error('Internal server error');
}
const getPage = async (id) => {
    const response = await fetch(`${SERVER_URL}/api/pages/${id}`);
    if (response.ok) {
        const pageJson = await response.json();
        const page = new Page(pageJson.id, pageJson.title, pageJson.authorId, pageJson.creationDate, pageJson.publicationDate)
        return page;
    } else if(response.status === 404){
        // handle 404 errors here
        throw Error('Page not found');
    }
    else
        throw new Error('Internal server error');
}

const createPage = async (page) => {
    const response = await fetch(`${SERVER_URL}/api/pages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(page),
        credentials: 'include'
    });
    if (!response.ok) {
        const errMessage = await response.json();
        throw errMessage
    }
    else {
        const responseBody = await response.json();
        return responseBody;
    }
}

const updatePage = async (id, page) => {
    const response = await fetch(`${SERVER_URL}/api/pages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(page),
        credentials: 'include'
    });
    if (!response.ok) {
        const errMessage = await response.json();
        throw errMessage
    }
    else return null;
}

const deletePage = async (id) => {
    const response = await fetch(`${SERVER_URL}/api/pages/${id}`, {
        method: 'DELETE',
        credentials: 'include'
    });
    if (!response.ok) {
        const errMessage = await response.json();
        throw errMessage
    }
    else return null;
}
/*---------------------------------------------BLOCK--------------------------------------------- */
/**
 * 
 * @param {integer} id id of the page
 * @returns all the blocks for that page
 */
const getBlocks = async (id) => {
    const response = await fetch(`${SERVER_URL}/api/pages/${id}/blocks`);
    if (response.ok) {
        const blockJson = await response.json();
        return blockJson.map(p => new Block(p.id, p.pageId, p.type, p.content, p.orders));
    }
    else
        throw new Error('Internal server error');
}
const createBlock = async (id, block) => {
    const response = await fetch(`${SERVER_URL}/api/pages/${id}/blocks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(block),
        credentials: 'include'
    });
    if (!response.ok) {
        const errMessage = await response.json();
        throw errMessage
    }
    else return null;
}
const updateBlock = async (id, blockId, block) => {
    const response = await fetch(`${SERVER_URL}/api/pages/${id}/blocks/${blockId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(block),
        credentials: 'include'
    });
    if (!response.ok) {
        const errMessage = await response.json();
        throw errMessage
    }
    else return null;
}

const deleteBlock = async (id, blockId) => {
    const response = await fetch(`${SERVER_URL}/api/pages/${id}/blocks/${blockId}`, {
        method: 'DELETE',
        credentials: 'include'
    });
    if (!response.ok) {
        const errMessage = await response.json();
        throw errMessage
    }
    else return null;
}

/*---------------------------------------------SESSION--------------------------------------------- */
const logIn = async (credentials) => {
    const response = await fetch(`${SERVER_URL}/api/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(credentials),
    });
    if(response.ok) {
      const user = await response.json();
      return user;
    }
    else {
      const errDetails = await response.text();
      throw errDetails;
    }
  };
  
  const getUserInfo = async () => {
    const response = await fetch(`${SERVER_URL}/api/sessions/current`, {
      credentials: 'include',
    });
    const user = await response.json();
    if (response.ok) {
      return user;
    } else {
      throw user;  // an object with the error coming from the server
    }
  };
  
  const logOut = async() => {
    const response = await fetch(`${SERVER_URL}/api/sessions/current`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (response.ok)
      return null;
  }

/*---------------------------------------------IMAGE--------------------------------------------- */
const getImages = async () => {
    const response = await fetch(`${SERVER_URL}/api/images`);
    if (response.ok) {
        const imagesJson = await response.json();
        return imagesJson.map(p => new Image(p.id, p.url));
    }
    else
        throw new Error('Internal server error');
}
const getImage = async (id) => {
    const response = await fetch(`${SERVER_URL}/api/images/${id}`);
    if (response.ok) {
        const imagesJson = await response.json();
        const image = new Page(imagesJson.id, imagesJson.url);
        return image;
    }
    else
        throw new Error('Internal server error');
}


/*---------------------------------------------USER--------------------------------------------- */
//dont know if i have to implement the list of 
//page for a user (is not reuested in the req)
//but still have the api written in index.js
const getUserById= async(id)=>{
    const response = await fetch(`${SERVER_URL}/api/users/${id}`);
    if(response.ok){
        const user = await response.json();
        return user;
    }else{
        throw new Error("Internal server error");
    }

}

const getAllUsers = async() =>{
    const response = await fetch(`${SERVER_URL}/api/users`);
    if(response.ok){
        const usersJson = await response.json();
        return usersJson;
    } else {
        throw new Error("Internal server error");
    }
}

/*---------------------------------------------WEBSITE--------------------------------------------- */
const getWebsiteName = async () => {//TODO
    const response = await fetch(`${SERVER_URL}/api/websitename/`);
    if (response.ok) {
        const websiteJson = await response.json();
        const website = new Website(websiteJson.id, websiteJson.name);
        return website;
    }
    else
        throw new Error('Internal server error');
}
const updateWebsiteName = async (name) => {//TODO
    const response = await fetch(`${SERVER_URL}/api/websitename`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({name:name}),
        credentials: 'include'
    });
    if (!response.ok) {
        const errMessage = await response.text();
        throw errMessage
    }
    else return null;
}


const API = {getPage, getPages, createPage, updatePage, deletePage, getBlocks, createBlock,
             updateBlock, deleteBlock, logIn, getUserInfo, getUserById, getAllUsers, logOut, getImages, getImage, getWebsiteName, updateWebsiteName};
export default API;