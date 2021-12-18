process.env.NODE_ENV = 'test';

const expect = require('chai').expect;
const request = require('supertest');
const app = require('./testApp');
const mongoose = require('mongoose');

describe('GET /scans', () => {
    before((done) => {
        mongoose.connect('mongodb+srv://admin:admin123@wavss-cluster.xco7y.mongodb.net/WAVSS-Test?retryWrites=true&w=majority', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }, () => {
            mongoose.connection.db.dropCollection('scans').then(() => {
                done();
            })
        });
    });

    after((done) => {
        mongoose.connection.close()
            .then(() => done())
            .catch((err) => done(err));
    });

    it('OK, /scan has no scans', (done) => {
        request(app).get('/scans')
            .then((res) => {
                const body = res.body;
                expect(body.length).to.equal(0);
                done();
            })
            .catch((err) => done(err));
    });

    it('OK, /scan has 1 scan', (done) => {
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
                    });
                done();
            })
            .catch((err) => done(err));
    });
})