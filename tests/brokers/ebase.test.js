import { findImplementation } from '@/index';
import * as ebase from '@/brokers/ebase';
import {
  buySamples,
  invalidSamples,
  mixedSamples,
  sellSamples,
} from './__mocks__/ebase';
import { allValidSamples } from './__mocks__/ebase';

// David Holin: No dividend samples test yet, as no example document is available
describe('Broker: ebase', () => {
  let consoleErrorSpy;

  test('should only accept revenue-summary reports', () => {
    expect(
      ebase.canParsePage(
        ['Fondsertrag / Vorabpauschale', 'ebase Depot flex standard'],
        'pdf'
      )
    ).toEqual(true);
  });

  test('should reject unknown PDF files', () => {
    expect(
      ebase.canParsePage([
        'This String should never occur in a legitimate document',
      ])
    ).toEqual(false);
  });

  test('should validate the result', () => {
    expect(ebase.parsePages(invalidSamples[0]).activities).toEqual(undefined);
  });

  describe('Check all documents', () => {
    test('Can parse one page containing sell orders with ebase', () => {
      sellSamples.forEach(samples => {
        expect(samples.some(item => ebase.canParsePage(item, 'pdf'))).toEqual(
          true
        );
      });
    });

    test('Can identify a broker from one page as ebase', () => {
      allValidSamples.forEach(samples => {
        const implementations = findImplementation(samples, 'pdf');

        expect(implementations.length).toEqual(1);
        expect(implementations[0]).toEqual(ebase);
      });
    });
  });

  describe('Validate buys', () => {
    test('Can parse multiple planned buy orders from a document', () => {
      const activities = ebase.parsePages(buySamples[0]).activities;
      expect(activities.length).toEqual(11);
      expect(activities[0]).toEqual({
        broker: 'ebase',
        type: 'Buy',
        date: '2020-07-01',
        datetime: '2020-07-01T' + activities[0].datetime.substring(11),
        isin: 'DE000A0X7541',
        company: 'ACATIS GANÉ VALUE EVENT FONDS A',
        shares: 0.054571,
        price: 311.52,
        amount: 17.0,
        tax: 0.0,
        fee: 0.0,
      });
      expect(activities[10]).toEqual({
        broker: 'ebase',
        type: 'Buy',
        date: '2020-07-01',
        datetime: '2020-07-01T' + activities[10].datetime.substring(11),
        isin: 'DE0009848119',
        company: 'DWS Top Dividende LD',
        shares: 0.126761,
        price: 120.7,
        amount: 15.3,
        tax: 0.0,
        fee: 0.0,
      });
    });

    test('Can parse multiple buy and planned buy orders from a document', () => {
      const activities = ebase.parsePages(buySamples[2]).activities;
      expect(activities.length).toEqual(5);
      expect(activities[3]).toEqual({
        broker: 'ebase',
        type: 'Buy',
        date: '2020-07-24',
        datetime: '2020-07-24T' + activities[3].datetime.substring(11),
        isin: 'DE000A2H7N24',
        company: 'The Digital Leaders Fund R',
        shares: 3.378835,
        price: 147.98,
        amount: 500.0,
        tax: 0.0,
        fee: 0.0,
      });
      expect(activities[4]).toEqual({
        broker: 'ebase',
        type: 'Buy',
        date: '2020-07-01',
        datetime: '2020-07-01T' + activities[4].datetime.substring(11),
        isin: 'DE000A2H7N24',
        company: 'The Digital Leaders Fund R',
        shares: 0.339997,
        price: 147.06,
        amount: 50,
        tax: 0.0,
        fee: 0.0,
      });
    });

    test('Can parse multiple buy orders from a finvesto document', () => {
      const activities = ebase.parsePages(buySamples[3]).activities;

      expect(activities.length).toEqual(21);
      expect(activities[0]).toEqual({
        broker: 'ebase',
        type: 'Buy',
        date: '2020-10-30',
        datetime: '2020-10-30T' + activities[0].datetime.substring(11),
        isin: 'IE00B4L5Y983',
        company: 'iShares Core MSCI World UCITS ETF USD (Acc)',
        shares: 0.747824,
        price: 53.38151781104801,
        amount: 40.0,
        tax: 0.0,
        fee: 0.0,
        foreignCurrency: 'USD',
        fxRate: 1.1622,
      });
      expect(activities[20]).toEqual({
        broker: 'ebase',
        type: 'Buy',
        date: '2019-11-21',
        datetime: '2019-11-21T' + activities[20].datetime.substring(11),
        isin: 'IE00B4L5Y983',
        company: 'iShares Core MSCI World UCITS ETF USD (Acc)',
        shares: 0.90628,
        price: 55.061169007702766,
        amount: 50,
        tax: 0.0,
        fee: 0.0,
        foreignCurrency: 'USD',
        fxRate: 1.1035,
      });
    });
  });

  describe('Validate sells', () => {
    test('Can parse multiple eremuneration sell orders from a document', () => {
      const activities = ebase.parsePages(sellSamples[0]).activities;
      expect(activities.length).toEqual(2);
      expect(activities[0]).toEqual({
        broker: 'ebase',
        type: 'Sell',
        date: '2019-12-19',
        datetime: '2019-12-19T' + activities[0].datetime.substring(11),
        isin: 'DE0009848119',
        company: 'DWS Top Dividende LD',
        shares: 0.343695,
        price: 130.93,
        amount: 45.0,
        tax: 0.0,
        fee: 0.0,
      });
      expect(activities[1]).toEqual({
        broker: 'ebase',
        type: 'Sell',
        date: '2018-12-19',
        datetime: '2018-12-19T' + activities[1].datetime.substring(11),
        isin: 'DE0009848119',
        company: 'DWS Top Dividende LD',
        shares: 0.394046,
        price: 114.2,
        amount: 45.0,
        tax: 0.0,
        fee: 0.0,
      });
    });

    test('Can parse multiple ordinary sell orders from a document', () => {
      const activities = ebase.parsePages(sellSamples[1]).activities;
      expect(activities.length).toEqual(11);
      expect(activities[0]).toEqual({
        broker: 'ebase',
        type: 'Sell',
        date: '2020-09-23',
        datetime: '2020-09-23T' + activities[0].datetime.substring(11),
        isin: 'FR0000292278',
        company: 'Magellan C',
        shares: 18.014988,
        price: 23.17,
        amount: 373.54,
        tax: 0.0,
        fee: 0.0,
      });
      expect(activities[10]).toEqual({
        broker: 'ebase',
        type: 'Sell',
        date: '2020-09-22',
        datetime: '2020-09-22T' + activities[10].datetime.substring(11),
        isin: 'DE0009848119',
        company: 'DWS Top Dividende LD',
        shares: 2.752834,
        price: 114.58,
        amount: 315.42,
        tax: 0.0,
        fee: 0.0,
      });
    });
  });

  describe('Mixed Sells, buys and everything in between', () => {
    test('Can parse multiple sell orders from a ebase file', () => {
      const activities = ebase.parsePages(mixedSamples[0]).activities;
      expect(activities.length).toEqual(327);
      expect(activities[11]).toEqual({
        broker: 'ebase',
        type: 'Buy',
        date: '2020-07-01',
        datetime: '2020-07-01T' + activities[11].datetime.substring(11),
        isin: 'DE000A0X7541',
        company: 'ACATIS GANÉ VALUE EVENT FONDS A',
        shares: 0.054571,
        price: 311.52,
        amount: 17.0,
        tax: 0.0,
        fee: 0.0,
      });
    });

    test('Can parse buy and sell orders from a finvesto file', () => {
      const activities = ebase.parsePages(mixedSamples[1]).activities;
      expect(activities.length).toEqual(34);
      expect(activities[33]).toEqual({
        broker: 'ebase',
        type: 'Buy',
        date: '2018-03-27',
        datetime: '2018-03-27T' + activities[33].datetime.substring(11),
        isin: 'LU0274208692',
        company: 'Xtrackers MSCI World Swap UCITS ETF 1C',
        shares: 0.863757,
        price: 46.31127649247694,
        amount: 40.0,
        tax: 0.0,
        fee: 0.0,
        fxRate: 1.2362,
        foreignCurrency: 'USD',
      });

      expect(activities[11]).toEqual({
        broker: 'ebase',
        type: 'Sell',
        date: '2019-12-19',
        datetime: '2019-12-19T' + activities[11].datetime.substring(11),
        isin: 'LU0274208692',
        company: 'Xtrackers MSCI World Swap UCITS ETF 1C',
        shares: 0.164912,
        price: 60.63982746225737,
        amount: 10.0,
        tax: 0.0,
        fee: 0.0,
        fxRate: 1.1128,
        foreignCurrency: 'USD',
      });
    });
  });

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });
});
