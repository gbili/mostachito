import { expect } from 'chai';
import getNestedPath from '../src/utils/getNestedPath';

describe(`getNestedPath`, function() {
  describe(`getNestedPath(dotNotation)`, function() {
    it('should return a an array', function() {
      expect(getNestedPath('this.is.an')).to.be.an('array');
    });
    it('should return an array with one more elements than dots in the string', function() {
      expect(getNestedPath('this.is.an').length).to.be.equal(3);
    });
    it('should return ["this", "is", "an"]', function() {
      expect(getNestedPath('this.is.an')).to.be.eql(["this", "is", "an"]);
    });
  });
});
