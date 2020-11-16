const request = require('supertest');

var fs = require('fs');

var chai = require('chai');


const app = require('../app');

const expect = chai.expect


function hasMessageKey(res)
{
    if (!res.body.hasOwnProperty('message')) throw new Error(`missing message key`);
}


describe("Download file", () => {
    let upload_url = "/upload/5";
    let download_url = "/download/";
    let payload = {
        appId: 5,
        fileName: ''
    }

    before((done) => {
        request(app)
            .post(upload_url)
            .attach('file', __dirname + '/download.spec.js')
            .end((err, res) => {
                if (err) done(err);
                payload.fileName = res.body[0]['newFileName']
                done();
            })
    })

    
    it("should return a 200 status code", (done)=> {
        request(app)
            .post(download_url)
            .send(payload)
            .end((err, res) => {
                if (err) done(err);

                expect(res.header['content-disposition']).to.be.equal(`attachment; filename="${payload.fileName.split('.gz')[0]}"`)
                expect(res.status).to.be.equal(200);
                done();
            })
    })


    it("should a 404 with message containing ressource not found", (done)=> {
        payload.fileName = "xxxx";

        request(app)
            .post(download_url)
            .send(payload)
            .expect(hasMessageKey)
            .end((err, res) => {
                if (err) done(err);

                expect(res.status).to.be.equal(404);
                expect(res.body.message).to.be.equal("ressource not found");
                done();
            })
    })
})