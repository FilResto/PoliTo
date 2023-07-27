'use strict'

const dayjs = require('dayjs');

function Page(id, title, authorId, creationDate, publicationDate){
    this.id = id; //integer
    this.title = title; //text
    this.authorId = authorId; //integer
    this.creationDate = dayjs(creationDate); //DATE dayjs
    this.publicationDate = (publicationDate !== "" && publicationDate !== null) ? dayjs(publicationDate) : null;

}
function Block(id, pageId, type, content, orders) {
    this.id = id;//integer
    this.pageId = pageId;//integer
    this.type = type;//text: header-paragraph-image
    this.content = content;//text (url/images)
    this.orders = orders;//integer
}

function Image(id, url){
    this.id=id;
    this.url=url;
}

module.exports = {Page, Block, Image};
