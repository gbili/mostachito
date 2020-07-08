class Mostachito {

  constructor(missingRefCallback) {
    this.missingRefCallback = missingRefCallback || function(ref) {
      throw new TypeError('Template references a data which is missing in the view, ref: ' + ref);
    };
  }

  hydrate(viewTemplate, viewData) {
    viewTemplate = this.replaceArray(viewTemplate, viewData);
    return this.replace(viewTemplate, viewData);
  }

  getRefList(viewTemplate) {
    const surroundingLen = '{{ '.length;
    const unsurroundedRefs = viewTemplate.match(new RegExp('{{ \\w+(?:\\.\\w+)* }}', 'gs')).map(surroundedRef => {
      return surroundedRef.substring(surroundingLen, surroundedRef.length-surroundingLen)
    });
    return (unsurroundedRefs && [...new Set(unsurroundedRefs)]) || [];
  }

  getNestedPath(dotNotation) {
    return dotNotation.split('.');
  }

  getReferencedValue(data, ref) {
    if (typeof data !== 'object') {
      throw new TypeError('You must pass an object to access its properties');
    }
    const nestedPath = this.getNestedPath(ref);
    let value = { ...data };
    for (let paramName of nestedPath) {
      if (!value.hasOwnProperty(paramName)) {
        return this.missingRefCallback(ref);
      }
      value = value[paramName];
    }
    return value;
  }

  replaceRef(viewTemplate, viewData, ref) {
    return viewTemplate.replace(
      new RegExp(`{{ ${ref} }}`, 'g'),
      this.getReferencedValue(viewData, ref)
    );
  }

  replace(viewTemplate, viewData) {
    const references = this.getRefList(viewTemplate);
    for (let ref of references) {
      viewTemplate = this.replaceRef(viewTemplate, viewData, ref)
    }
    return viewTemplate;
  }

  replaceArray(viewTemplate, viewData) {
    let r = new RegExp('{{(\\w+(?:\\.\\w+)*) as (\\w+)(.+)\\1}}', 'sg');
    let match = r.exec(viewTemplate);
    if (!match) {
      return viewTemplate;
    }
    let tpl = match[0];
    let outerRef = match[1];
    let subDatas = this.getReferencedValue(viewData, outerRef)
    let innerRef = match[2];
    let subTpl = match[3];
    let subTplWithoutInnerRefPrefix = subTpl.replace(new RegExp(`{{ ${innerRef}\\.`, 'g'), '{{ ');
    let hydratedViewPart = subDatas.map((function(subData) {
      return this.replace(subTplWithoutInnerRefPrefix, subData);
    }).bind(this)).join('');
    viewTemplate = viewTemplate.replace(
      new RegExp(tpl, 'g'),
      hydratedViewPart
    );
    return viewTemplate;
  }

}

export default Mostachito;
