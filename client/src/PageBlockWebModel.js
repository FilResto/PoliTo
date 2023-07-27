'use strict'
import dayjs from "dayjs";
/**
 * 
 * @param {integer} id on the db is INTEGER
 * @param {string} title on the db is TEXT
 * @param {integer} authorId on the db is INTEGER
 * @param {dayjs} creationDate on the db is DATE
 * @param {dayjs} publicationDate on the db is DATE
 */
function Page(id, title, authorId, creationDate, publicationDate) {
    this.id = id; //integer
    this.title = title; //text
    this.authorId = authorId; //integer
    this.creationDate = dayjs(creationDate); //DATE dayjs
    this.publicationDate = (publicationDate !== "" && publicationDate !== null) ? dayjs(publicationDate) : null;
    /**
     * 
     * @returns to correctly convert the dayjs format into a format that can be passed between components
     */
    this.serialize = () => {
        return {
            id: this.id,
            title: this.title,
            authorId: this.authorId,
            creationDate: this.creationDate.format('YYYY-MM-DD'),
            publicationDate: this.publicationDate ? this.publicationDate.format('YYYY-MM-DD') : null
        };
    }


}
/**
 * 
 * @param {integer} id on the db is INTEGER
 * @param {integer} pageId on the db is INTEGER
 * @param {string} type on the db is TEXT
 * @param {string} content on the db is TEXT
 * @param {integer} orders on the db is INTEGER
 */
function Block(id, pageId, type, content, orders) {
    this.id = id;//integer
    this.pageId = pageId;//integer
    this.type = type;//text: header-paragraph-image
    this.content = content;//text (url/images)
    this.orders = orders;//integer
    this.serialize = () => {
        return {
            id: this.id,
            pageId: this.pageId,
            type: this.type,
            content: this.content,
            orders: this.orders
        };
    }
}
/**
 * 
 * @param {id} id on the db is INTEGER
 * @param {url} url on the db is TEXT
 */
function Image(id, url) {
    this.id = id;
    this.url = url;
}
/**
 * 
 * @param {id} id on the db is INTEGER
 * @param {name} url on the db is TEXT
 */
function Website(id, name) {
    this.id = id;
    this.name = name;
}

function User(id, username, role){
    this.id = id;
    this.username = username;
    this.role = role;
}
export { Page, Block, Image, Website, User };