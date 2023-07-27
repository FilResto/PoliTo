This is a WebApplication done is React. It is like a blog where people authenticated can publish pages and see other publiched pages.
Non-authorized user can't create any page, they are able to see only published pages.
After this brief introduction to the application, in the follwing sections you will find all the features of this project, starting from all the routes -> API -> purpose of each react component -> database model -> username and password of each registered user.

In order to run the application, first, you have to open 2 terminals, the first one on the server (cd server) and the second one on the client (cd client), after this you have to write "npm i" on both of them. After this you are able to run the application by doing first on the server "nodemon index.js" and then on the client "npm run dev".

## React Client Application Routes

- Route `/`: This is the homepage of the application. It lists all the page that have been fetched from the API and displays them through the PageList component. If the user is loggedIn then all the pages are displayed, if not, only the published pages are displayed.
- Route `/pages/:id`: This is a dynamic route that displays a single page based on the `:id`. The SinglePageComponent is used to display the content of the page (title, creationDate etc) with also the related blocks.
- Route `/add`: This route displays a form which purpose is to add a new page thanks to the `AddForm` component. 
- Route `/edit/:id`: It is similar to the `/add` route, but in this case the route provides a form to edit an existing page, based on the `:id` through the `EditForm` component.
- Route `/login`: This route displays the login form thanks to the `LoginForm` component.
- Route `*`: This route matches any path that doesn't correspond to any of the definied routes. So, if a user tries to navigate to a non-existing route, then the `NotFound` component is rendered.

## API Server

### Session
##### Login
- POST `/api/sessions`
- Description: authenticate the user who is trying to login
- Request parameters: _None_
- Response: `201 Created` (success),`401 Unauthorized User` (login failed),`500 Internal Server Error` (generic error).
- Response body content:
```
{
  "id": 2,
  "username": "User2",
  "role": "user"
}
```
##### Check if user is logged in
- GET `/api/sessions/current`
- Description: check if current user is logged in and get her data
- Request parameters:_None_
- Request body content: _None_
- Reponse: `200 OK` (success), `401 Unauthorized`(user is not logged in), `500 Internal Server Error` (generic error)
- Response body:
```
{ 
  "id": 2,
  "username": "User2",
  "role": "user"
}
```
##### Logout
- DELETE `/api/sessions/current`
- Description: logout current user
- Request Parameters: _None_
- Response: `200 OK` (success),`401 Unauthorized`(user is not logged in), `500 Internal Server Error` (generic error)
- Response body: _None_

### Get all pages

- GET  `/api/pages`
- Description: Retrieves all pages from the database.
- Request body: None.
- Response: `200 OK` (success) or `500 Internal Server Error` (generic error).
- Response body: A JSON array of objects, each describing a page
```
[  
  {    
    "id": 1,    
    "title": "Title1",    
    "authorId": 1,    
    "creationDate": "2022-05-01",    
    "publicationDate": "2022-06-01"  
  },  
  {    
      "id": 2,    
      "title": "Title2",   
      "authorId": 2,    
      "creationDate": "2022-05-02",    
      "publicationDate": "2022-06-02" 
  },  ...]
```
### Get a specific page by id
- GET `/api/pages/:id`
- Description: Retrieves a specific page from the database corresponding to the id.
- Request parameters: id of the page to retrieve.
- Request body: None.
- Response: `200 OK` (success), `404 Not Found` (wrong id), or `500 Internal Server Error` (generic error).
- Response body:
```
{
  "id": 1,
  "title": "Title1",
  "authorId": 1,
  "creationDate": "2022-05-01",
  "publicationDate": "2022-06-01"
}

```
 
### Create a new page
- POST `/api/pages`
- Description: Creates a new page for the authorId 1. Admin can change authorId. Id value is not required and is ignored.
- Response: `201 Created` (success) or `503 Service Unavailable` (generic error). If the request body is not valid, `422 Unprocessable Entity` (validation error). `404 Not Found` (author Id not found)
- Request body: A JSON object representing a new page
```
{
  "id": 1,
  "title": "New Title",
  "authorId": 1,
  "creationDate": "2022-05-01",
  "publicationDate": "2022-06-01"
}

```

### Update an existing page
- PUT `/api/pages/:id`
- Description: Updates a specific page in the database. Admin can change authorId. `id` value is not required and is ignored, as well as the `creationDate`.
- Request parameters: id of the page to update.
- Request body:
```
{
  "id": 1,
  "title": "Updated Title",
  "authorId": 3,(only admin)
  "creationDate": "2022-05-01",
  "publicationDate": "2022-06-01"
}
```
- Response body: None.
- Response: `200 OK` (success), `404 Not Found` (wrong id), or `503 Service Unavailable` (generic error). If the request body is not valid, `422 Unprocessable Entity` (validation error).

### Delete an existing page
- DELETE `/api/pages/:id`
- Description: Deletes a specific page by its id.
- Request parameters: id of the page to delete.
- Request body: None.
- Response body: None.
- Response: `200 OK` (success), `404 Not Found` (wrong id), or `503 Service Unavailable` (generic error).

 

---
### Get All Blocks for a Page (getBlocksForPage)
- GET  `/api/pages/:id/blocks`
- Description: Retrieves all blocks belonging to a specific page `:id`.
- Response body: A JSON array of objects, each describing a block
```
  [  
    {  
      "id": 1,    
      "pageId": 1,    
      "type": "header",    
      "content": "Welcome to the page",
      "orders" : 1  
    },  
    {    
      "id": 2,    
      "pageId": 1,    
      "type": "paragraph",    
      "content": "test paragraph"  
      "orders" : 2
      }
  ]

```
- Response: `200 OK` (success), `500 Internal Server Error` (generic error).
- Example: `/api/pages/1/blocks`

### Create a block (createBlock)
- POST `/api/pages/:id/blocks`
- Description: Creates a new block within the specified page. `id` value and `blockId` value are not required and are ignored.

- Request body: A JSON object representing the new block
```
  {
    "id": 1,    
    "pageId": 1,
    "type": "paragraph",
    "content": "New paragraph"
    "orders" : 1
  }
```
- Response: `201 Created` (success) or `503 Service Unavailable` (generic error). If the request body is not valid, `422 Unprocessable Entity` (validation error). If orders is invalid (not sequential) `400 Bad Request`.
- Response body: _None_
- Example: `/api/pages/1/blocks`

### Update a block in a Page (updateBlock)
- PUT `PUT /api/pages/:id/blocks/:blockId`
- Description: Update an identified by `:blockId`. `id` value and `blockId` value are not required and are ignored.


- Request body: A JSON object representing the block.
```
  {
  "id": 1,    
  "pageId": 1,
  "type": "header",
  "content": "New Header",
  "orders" : 1
  }
```
- Response: `200 OK` (success). `503 Service Unavailable` (generic error). If the request body is not valid, `422 Unprocessable Entity` (validation error).
- Response body: _None_
- Example: `/api/blocks/2`

### Delete a block in a Page (deleteBlock)
- DELETE  `DELETE  /api/pages/:id/blocks/:blockId`
- Description: Delete an identified block by `:blockId`
- Request body: _None_
- Response: `200 OK` (success). `500 Internal Server Error` (generic error). `503 Service Unavailable`(service unavailable)
- Response body: _None_
- Example: `/api/pages/1/blocks/1`

---
### Get user info by id(getUserById)
- GET `GET /api/users/1`
- Description: Get the user info (only id and username)
- Request body: _None_
- Response body: A JSON object representing the user
- Response: `200 OK` (success). `500 Internal Server Error`.  (generic error). `404 Not Found` (wrong id)
- Response Body:
```
{
  "id": 1,
  "username": "Admin"
  "role": "admin"
}
```
### Get All users + info (getAllUsers)
- GET `GET /api/users`
- Description: Get All users + info (only id and username and role)
- Response body: A JSON array representing all the users
- Response: `200 OK` (success). `500 Internal Server Error`.  (generic error).
- Response Body: 
```
[
  {
    "id": 1,
    "username": "Admin",
    "role": "admin"
  },
  {
    "id": 2,
    "username": "User2",
    "role": "user"
  },...
]
```
---
### Get the Website name (getWebsiteName)
- GET `GET /api/websitename`
- Description: Get the website name
- Request body: _None_
- Response: `200 OK` (success).`500 Internal Server Error` (generic error). `404 Not Found`
- Response body: A JSON object representing the name of the website
```
{
  "id": 1,
  "name": "CMSmall"
}
```
### Update website name (only admin)
- PUT `PUT /api/websitename`
- Description: Modify the website name. `id` value is not required and is ignored.
- Request body: The new name of the website
```
{
  "id": 1,
  "name": "BTS"
}
```
- Response: `200 OK` (success).`503 Service Unavailable` (generic error).`404 Not Found`. `422 Unprocessable Entity` (validation error).
- Response body: _None_
---
### Get all Images (listImages)
- GET `GET /api/images`
- Description: Get the all the Images in the db
- Request body: _None_
- Response: `200 OK` (success).`500 Internal Server Error` (generic error).
- Response body: A JSON array representing all the images on the db.
```
[
  {
    "id": 1,
    "url": "https://images.pexels.com/photos/20787/pexels-photo.jpg?auto=compress&cs=tinysrgb&h=350"
  },
  {
    "id": 2,
    "url": "https://1000logos.net/wp-content/uploads/2018/03/BTS_Logo.png"
  },...
]
```
### Get a single image (getImage)
- GET `GET /api/images/:id`
- Description: Get a single image present on the db
- Request body: _None_
- Response: `200 OK` (success).`500 Internal Server Error` (generic error). `404 Not Found`
- Response body: A JSON object representing the image
```
{
  "id": 2,
  "url": "https://1000logos.net/wp-content/uploads/2018/03/BTS_Logo.png"
}
```


## Database Tables

- Table `users`   -  id email  username pasword(hashed) salt role
- Table `blocks`  -  id pageId type     content orders
- Table `pages`   -  id title  authorId creationDate pubblicationDate
- Table `website` -  id name
- Table `image` -  id url
## Main React Components
### App 
- `App` (in `App.jsx`)
Is the root component of the Web Application.  It contains most of the logic of the application. It contains the most important state of the application which are passed throught props for rendering other components in each Route.
1) **Main States:** 
- `pages`: An array of pages fetched from the server.
- `loggedIn`: A boolean value indicating whether the user is currently logged in.
- `message`: A string that may contain a message to be displayed to the user (such as a success or error message).
- `websiteName`: The name of the website, fetched from the server.
- `user`: The currently logged in user.
- `loading`: Just done in order to wait data to be load from the server

1) **useEffect**
In this component there are several useEffect in order to fetch correctly data needed for the application to work.
- The `first` useEffect checks if the user is authenticated when the component first loads and this useEffect is triggered always when the `loggedIn` state changes. If the user is authenticated, it fetches his info and sets loggedIn to true.
- The `second` useEffect fetches all pages from the server when the component first loads.
- The `third` useEffect fetches the website name from the server when the component first loads.
I used three different useEffect in order to prevent unnecessary calls, so maybe a changes of a state will trigger the whole useEffect instead of triggering the onle small useEffect (i.e if I merge all the useEffect then changing the loggedIn means refetch all the pages and website name, even if it's not necessary). Also, separating the useEffects makes the code easier to read and maintain and to avoid running unnecessary code
1) **Event Handler**
- `handleLogin` attempts to log the user in when they submit the login form. If the login is successful, it updates the loggedIn state to true and displays a welcome message. If the login fails (i.e. password or email wrong), it displays an error message.
- `handleLogout` Its purpose is to logout the user and set the loggedIn state to false and clears any message.
- `handleUpdateWebsiteName` updates the website name on the server and in the state.
2) **Return & Routing**
- The index route `"/"` displays a list of pages (`PageList`).
- The `"/pages/:id"` route displays a single page (`SinglePageComponent`).
- The `"/add"` route displays a form to add a new page (`AddForm`), but only if the user is logged in. Otherwise, it redirects to the index route.
- The `"/edit/:id"` route displays a form to edit an existing page (`EditForm`), but only if the user is logged in. Otherwise, it redirects to the index route.
- The `"/login"` route displays a login form (`LoginForm`), but only if the user is not logged in. Otherwise, it redirects to the index route.
- For any other route (`*`) the App redirects to the `NotFound` component.


### PageList
`PageList` (in `PageListComponent.jsx`): 
Is the main component that is rendered whenever we access to the Web Application, it contains the list of all the pages in  the entire application. 
If the user is not authenticated only the published pages are shown, if not, all pages are shown to the authenticated user.

The useEffect is responsible to fetch all the users, in order to pass it as props to the component `PageRow`.
It sorts all the page based on the publicationDate and filters the page based if the user is authenticated or not.

Handles the adding, deleting, and editing of pages. When one of these actions is performed, it redirects the user to the appropriate route or updates the list of pages accordingly.

At the end it renders a list of `PageRow` components, one for each page and at the bottom shows a button to add a new page that triggers the handleAddClick.

### PageRow
`PageRow` (in `PageListComponent.jsx`)
This component is rendered by the PageListComponent, rapresents the individual page in the list of pages. 
Its job is to display some information about the page, for example the author who made the page, its status and the publicationDate, if exists.

On the right side of a PageRow a Edit and Delete button is added in order for the loggedIn user to edit or delete the page. The admin sees all the buttons in every row, instead, the user that's not an admin sees only the buttons for the pages which is the author.

To get the username of the author, it finds the user in the users list with an `id` that matches the `authorId` of the page. The username is then stored in the local state authorName to be displayed in the page row. 

The useEffect hook ensures that authorName gets updated whenever the list of users or the authorId of the page changes.
By pressing the page Title the user is redirected to the full page (aka SinglePageComponent) with all the information.


### SinglePageComponent
`SinglePageComponent` (in `SinglePageComponent.jsx`)
The main function of this component is to display **all** the details of a single page and **all** the blocks associated with the page of a given `id`. The id is taken from the url parameter.

The main useEffect gets all the page info (*page title, creation date, publication date, and author id*) and the corrispondent blocks based on the id. 
The component first renders the `PageDescription` component and then maps over `blocks`(contains all the blocks of the page) and for each block, based on the type, it renders the `HeaderBlock`/`ParagraphBlock`/`ImageBlock` passing the content of the block as a prop.
If the page is *falsy* the Alert component is rendered and displays an error message.

At the end of the return a button `Back` is rendered in order to return on the PageListComponent (aka the homepage of the web application).


### PageDescription
`PageDescription` (in `SinglePageComponent.jsx`)
The main purpose of this component is defining the *status* of the page, passing it to the PageHeader, with also the *pageId,creationDate, author, publicationDate and loggedIn.* This component also renders `PageText`.

### PageHeader
`PageHeader` (in `SinglePageComponent.jsx`)
The main purpose of this component is showing the status of the page, followed by the author and the publicationDate if exists.

Thanks to the author (authorId) that was passed as props by the upper component, we can fetch the username by that authorId in order to show the name of the user who made the page.

Then, in the return, some information about the page are displayed, such as the title, author name (thanks to the fetch), creationDate (only for loggedIn users) and If a publication date exists, it displays a message either indicating when the page was published, or when it's scheduled to be published, depending on the current date. 

### PageText
`PageText` (in `SinglePageComponent.jsx`):
The only purpose of this component is showing the *title* of the page (passed as props)

### HeaderBlock
`HeaderBlock` (in `BlockComponent.jsx`)
The only props of this component is the *content* passed by the `SinglePageComponent`. It simply display an *h2* element with a particular *font size, color* and *text shadow*. In the `div` I used a `centerStyle` object in order to center the content in a column layout. 

### ParagraphBlock
`ParagraphBlock` (in `BlockComponent.jsx`)
It is very similar to the HeaderBlock and, as the HeaderBlock, he only props of this component is the `content` passed by the `SinglePageComponent`.
Since it's a paragraph I used `<p></p>` with a particular style thanks to the `style` object. Also this component is centered using `centerStyle` object. 

### ImageBlock
`ImageBlock` (in `BlockComponent.jsx`): 
This component also takes `content` as a prop from `SinglePageComponent`. However in this case the content is a `url`, so it's suppose the be an image. This url is passed to the `src` attribute inside the `img`. The image has a max width of 30% and the height is automatically adjusted. The image, as the other two components, is also centered using centerStyle.

### AddForm
`AddForm` (in `PageForm.jsx`)
The main purpose of this component is creating a new page and also blocks inside the page from scratch.
Each block is an object that contains a type, content, and orders. Block types can be `header`, `paragraph`, or `image`.

1) **Props**
It receives two props from the App.jsx: `user` and `updatePages`. The user is an object containing all the info about the current loggedIn users (*id, username, role*). The `updatePages` is a function that updates the list of the pages in the `App` component state by fetching the latest pages from the server and is called whenever we submit the form in order to display also the new page added.
`role`:It represents the role of the currently logged-in user.
1) **States**
Here is the list of the most important states for this component:
- `showError`: This boolean state determines whether an error modal should be displayed or not. It's initialized as false (meaning the error modal isn't shown at the start), and it's set to true when an error occurs.
- `errorMessage`: This string state stores the error message to be displayed in the error modal. It's initially an empty string and is updated with relevant error messages as they occur.
- `title`, `authorId`,`publicationDate`
- `creationDate`: This state stores the creationDate of the page, it's set by default dayjs(), so today.
- `blocks`:Is array which stores the blocks of the page being created. The state is initially empty cause we are creating the page
- `showModal`: This boolean state determines whether a modal for selecting images should be displayed.
- `images`: This array state stores the list of all the images in the db

- `selectedImage`: It's initially null, but when the user selects an image in this state will be set the url of the image
- `users`: This array state stores the list of all users. This is used to check whether the author ID exists among the registered users. It's initially an empty array.

3) **useEffect**
There is only one useEffect inside this component, it's done in order to fetch all the users from the users when the component first mount, it is used also to validate the authorId when a new page is created.

4) **Handle Event**
- `handleTitleChange`, `handleAuthorIdChange` and `handlePublicationDateChange` are used to update the state for the page title, author ID, and publication date respectively. The handleAuthorIdChange can be performed only if the current user is the admin.
- `handleBlockTypeChange`, `handleBlockContentChange` and `handleBlockOrderChange` update the corresponding field for a specific block in the blocks array. If the type of a block is changed to 'image', the available images are fetched from the server and a modal is displayed to allow the user to select an image.
- `handleAddBlock` and `handleRemoveBlock` add a new block at the end of the blocks array or remove a specific block from the blocks array.
- `showErrorModal` sets the errorMessage state and makes the error modal visible.
- `handleSubmit` is the most important handle event of the component. It is called when the form is submitted. First of all it checks some constraints are satisfied (i.e. authorId should exist, there will be at least one block header and one paragraph/image, check if the orders are sequential, the publicationDate must be after the creationDate that is always today and if the content is `header` or `paragraph` they must be text). After the checks, a newPage is created with the field declared in the form and also the blocks related to the page are created in ascendent orders, the user is redirected to the new page created and the form fields are resetted.
5) **Return, Form and Modals**
The form consists in the `title`, `authorId` and `publicationDate` with also the content `blocks` of the page.
- `Title` is text and the value of it is the `title` state declared above, the title is updated via `handleTitleChange` whenever the user types in the field.
- `Author ID` is the same as title, but is number and when the user types on it it triggers the `handleAuthorIdChange`, this field cannot be changed by a normal user but only by admin
- `Publication Date`: This is a date input field that's tied to the publicationDate state and it is updated with `handlePublicationDateChange` handler
- At this point I use `blocks.map((...))` to create a list of block form based on the state `blocks`. `idx` is the index of the current block in the blocks array and it's used to identify the specific block that's beeing modified when an handle event is called(i.e handleBlockTypeChanghe).
- By selecting the type of the block if it's an image then the content input is a dropdown menu `(as="select")` and the user can select the image he wants from the menu. If the block type is not image then the content input is a text field.
- `Modal` is used in order to display the error message if one of the constraints is not satisfied, if you press on close the setShowError will be set to false and the modal will disappear.


### EditForm
- `EditForm` (in `PageForm.jsx`)
I decided to separate it from the AddForm, even tho some parts of the code are repeated.
The main purpose of this component is to edit an existent page and the blocks inside it, the users can edit only the pages they made, instead the admin can edit every single page.
1) **Props**
Most of the props are equal to the one in AddPage. The new props are:
- `pageData` it contains all the info already in the page
- `blockData` it contains all the info of the blocks if the page
- `originalBlocks` is a copy of the original state of the blocks for comparison during submission.
- `currentBlocks` is the current state of the blocks during editing.

2) **UseEffect**
- The `first` useEffect fetches the list of all users from the API and stores it in the users state variable.
- The `second` useEffect fetches the data for the page and its blocks from the API, and stores them in the pageData, originalBlocks, and currentBlocks state variables.
- The `third` useEffect sets the title, authorId, publicationDate, and blocks state variables whenever pageData or blocksData change.
- The `fourth` useEffect fetches the list of all images from the API and stores it in the images state variable.

3) **Handle Event**
All the handlers use `currentBlocks` instead of `originalBlocks`. This is done because currentBlocks is the working copy and it-s used to separate the presentation of the data(which might change as the user interacts with the page)from the data itself (which only changes when saved to the server).
This approach ensures that any changes made by the user are first validated and only then reflected in the original data. it also gives the possibility to revert changes, for instance, by setting currentBlocks back to originalBlocks. If you used originalBlocks directly, once a change is made, you would lose the original state.

- `handleTitleChange`, `handleAuthorIdChange` and `handlePublicationDateChange` are handlers for the page's title, author ID, and publication date, respectively. These handlers update the corresponding state with the new value from the form field.

- `handleBlockTypeChange`, `handleBlockContentChange`, and `handleBlockOrderChange` are handlers for changing the type, content, and order of a block, respectively. Each function receives an index `idx`, which indicates which block in the array needs to be updated. The handlers then return a function which updates the relevant property of the block at that index in the array. They do this by mapping over the `currentBlocks` state and returning a new array where the block at the given index is updated, and all other blocks remain the same.

- `handleAddBlock` and `handleRemoveBlock` are handlers for adding a new block and removing an existing block, respectively. These handlers also work by creating a new array based on the `currentBlocks` state.
- `handleSubmit`: `e.preventDefault()`: This prevents the default form submission behavior, which would cause a page refresh.
After we check the same validator errors as for the AddPage, if any of them fails the error modal is shown with the respective error message for the validator that failed.
The `updatedPage` object is prepared with all the necessary fields that need to be sent to the API for the update operation.
Inside the **try catch block**: 
We call `API.updatePage(...)` and this line of code is where the API call to update the page is made.
Then we compare the originalBlocks array with the currentBlocks in order to find if some blocks in the originalBlocks are not anymore in the currentBlocks, if we find some of them that means they need to be deleted from the db so we call the `API.deleteBlock` with the corresponding page id (id) and block.id.
The blocks in the `currentBlocks` array are then `sorted` by their order, and for each block, it checks if it has an id or not. If it does not, it means the block was created in this session and it is added to the backend with await `API.createBlock(id, block)`. If it does, it means the block already existed and it is updated with await API.updateBlock(id, block.id, block);
Once all operations have completed the `props.updatedPages()` is called in order to update the pages and use is redirected to the page that has been midified.
4) **Return**
The return form is basically the same of the `AddForm component`. The only thing that is different is that all the blocks present in the page are already shown and filled with data thanks to the map over `currentBlocks`, which for each block it creates a new set of form inputs pre-filled with the block's current info.
The modal is the same of AddForm and it shows an error message every time a constraint is not satisfied.


### NavHeader
`NavHeader` (in `NavBarComponent.jsx`):
NavHeader takes as props from App the `user` info, `websitename`, `handlelogout`, and the function `updateWebsiteName`. Its purpose is to show the name of the website and by clicking it it redirects you in the homepage(PageListComponent).
If the user loggedIn is an admin a button "ChangeWebsiteName" is shown and this allows the admin to change the name of the site through a model.
Then is the user is unauthorized a login button is displayed and links you to the login page, if is authorized the logout button is shown and by clicking it the user logged out and the current session is deleted.

### ChangeWebsiteName
`ChangeWebsiteName` (in `ChangeWebsiteForm.jsx`)
ChangeWebsiteName is simply a form (modal) which is shown every time the admin clicks on the button on the navbar, by submitting the form the api updateWebsiteName is called with the current name inserted and its job is to update the table website in the database

### LoginForm
`LoginForm` (in `AuthComponent.jsx`)
In the `handleSubmit` function, an object credentials is created with the `username` and `password`. Then `props.login(credentials)` is called. This function is passed as a prop from the parent component (App.js) and is responsible for making the API call to login the user.
In the form an `Alert` is shown evenever the user inserts wrong credentials. Inside each `Form.Control` the value prop is set to the state variable that stores the user input and the `onChange` event is set to update the state variable when the user enters input.

### LogoutButton
`LogoutButton` (in `AuthComponent.jsx`):
This is a component that displays a button to log out. It takes a logout function as a prop (from App.jsx) and calls it when the button is clicked. The logout function is responsible for making the API call to log out the user.

### LoginButton
`LoginButton` (in `AuthComponent.jsx`)
This component is similar to the LogoutButton component but instead of logging out, it redirects the user to the login page when clicked. 

### NotFound
`NotFound` (in `NotFoundComponent.jsx`)
This component is rendered everytime a unusual route is inserted in the url


## Screenshot
### HomePage loggedIn user (user2)
![Screenshot](./images/homepage%20user2.jpeg)
### Add a page (user2 loggedIn)
![Screenshot](./images/add%20user2.jpeg)

## Users Credentials


|         email         |  plain-text password |
|-----------------------|----------------------|
| admin@gmail.com       |  pasadminadminsword  |
| user2@gmail.com       |  user2user2          |
| user3@gmail.com       |  user3user3          |
| user4@gmail.com       |  user4user4          |
=======
# PoliTo
In this folder I will add all the projects related to my master's degree at Politecnico di Torino
>>>>>>> 5ee29684c095005438820d53f96fc45a35ed6185
