process.env.NODE_ENV = 'test';

const expect = require('chai').expect;
const request = require('supertest');
const app = require('./testApp');
const conn = require('../config/database');

describe('GET /scans', () => {
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

    it('OK, Database has no scans', (done) => {
        request(app).get('/scans')
            .then((res) => {
                const body = res.body;
                expect(body.length).to.equal(0);
                done();
            })
            .catch((err) => done(err));
    });

    it('OK, getting notes has 1 scan', (done) => {
        request(app).post('/scans')
            .send({
                scanname: 'Test Scan',
                url: 'http://example.com/',
                ports: '80',
                scantype: 'Full Scan',
            })
            .then((_) => {
                request(app).get('/scans')
                    .then((res) => {
                        const body = res.body;
                        expect(body.length).to.equal(1);
                        done();
                    })
            })
            .catch((err) => done(err));
    });
})