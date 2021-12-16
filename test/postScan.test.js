process.env.NODE_ENV = 'test';

const expect = require('chai').expect;
const request = require('supertest');
const app = require('./testApp');
const conn = require('../config/database');

describe('POST /scans', () => {
    before((done) => {
        conn.connect()
            .then(() => done())
            .catch((err) => done(err));
    })

    after((done) => {
        conn.close()
            .then(() => done())
            .catch((err) => done(err));
    })

    it('OK, creating a new Scan works', (done) => {
        request(app).post('/scans')
            .send({
                scanname: 'Test Scan',
                url: 'http://example.com/',
                ports: '80',
                scantype: 'Full Scan',
            })
            .then((res) => {
                const body = res.body;
                expect(body).to.contain.property('_id');
                expect(body).to.contain.property('scanname');
                expect(body).to.contain.property('url');
                expect(body).to.contain.property('user');
                expect(body).to.contain.property('ports');
                expect(body).to.contain.property('scantype');
                done();
            })
            .catch((err) => done(err));
    });

    it('Fail, Scan requires scanname', (done) => {
        request(app).post('/notes')
            .send({
                name: 'NOTE',
                url: 'http://example.com/',
                ports: '80',
                scantype: 'Full Scan',
            })
            .then((res) => {
                const body = res.body;
                expect(body.errors.text.name)
                    .to.equal('ValidatorError')
                done();
            })
            .catch((err) => done(err));
    });
})