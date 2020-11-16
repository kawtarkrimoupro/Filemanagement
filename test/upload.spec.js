const request = require('supertest');

var chai = require('chai');


const app = require('../app');

const expect = chai.expect

/*
 *  Functions to check for a specific keys in the response body
 */
function hasFileNameKey(res)
{
    if (!res.body[0].hasOwnProperty('newFileName')) throw new Error(`missing newFileName key`);
}

function hasMessageKey(res)
{
    if (!res.body.hasOwnProperty('message')) throw new Error(`missing message key`);
}

describe("Upload a file", ()=> {

    let end_point = "/upload/5";

    it("should return a 200 status code with the new filename", (done) => {
        request(app)
            .post(end_point)
            .attach('file', __dirname + '/upload.spec.js')
            .expect(hasFileNameKey)
            .expect(200, done)
    })


    it("should retuan a 200 status code with an array of 2 files name", (done) => {
        request(app)
            .post(end_point)
            .attach('file', __dirname + '/upload.spec.js')
            .attach('file', __dirname + '/upload.spec.js')
            .end((err, res) => {
                if (err) done(err);
                expect(res.status).to.be.equal(200);
                expect(res.body.length).to.be.equal(2);
                done();
            })
    })

    it("should return a 400 and chose at least one file response", (done) => {
        request(app)
            .post(end_point)
            .attach('file', '')
            .expect(hasMessageKey)
            .expect(400)
            .end((err, res) => {
                if (err) done(err);

                expect(res.body.message).to.be.equal("Please Give at least one file.")
                done();
            })
    })
})