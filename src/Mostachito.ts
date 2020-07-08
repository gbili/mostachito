import { peelOnionUsingDotRef } from "./utils/peelOnion";

class Mostachito {
  private missingRefCallback: MissingRefCallback;

  constructor(missingRefCallback?: MissingRefCallback) {
    this.missingRefCallback = missingRefCallback || function(ref: string) {
      throw new TypeError('Template references a data which is missing in the view, ref: ' + ref);
    };
  }

  hydrate(viewTemplate: string, viewData: ViewData) {
    viewTemplate = this.replaceArray(viewTemplate, viewData);
    return this.replace(viewTemplate, viewData);
  }

  getRefList(viewTemplate: string) {
    const surroundingLen = '{{ '.length;
    const unsurroundedRefs = viewTemplate.match(new RegExp('{{ \\w+(?:\\.\\w+)* }}', 'gs'))?.map(surroundedRef => {
      return surroundedRef.substring(surroundingLen, surroundedRef.length-surroundingLen)
    });
    return (unsurroundedRefs && [...new Set(unsurroundedRefs)]) || [];
  }

  replaceRef(viewTemplate: string, viewData: ViewData, ref: string) {
    return viewTemplate.replace(
      new RegExp(`{{ ${ref} }}`, 'g'),
      peelOnionUsingDotRef(viewData, ref, this.missingRefCallback)
    );
  }

  replace(viewTemplate: string, viewData: ViewData) {
    const references = this.getRefList(viewTemplate);
    for (let ref of references) {
      viewTemplate = this.replaceRef(viewTemplate, viewData, ref)
    }
    return viewTemplate;
  }

  replaceArray(viewTemplate: string, viewData: ViewData) {
    let r = new RegExp('{{(\\w+(?:\\.\\w+)*) as (\\w+)(.+)\\1}}', 'sg');
    let match = r.exec(viewTemplate);
    if (!match) {
      return viewTemplate;
    }
    let tpl = match[0];
    let outerRef = match[1];
    let subDatas = peelOnionUsingDotRef(viewData, outerRef, this.missingRefCallback)
    let innerRef = match[2];
    let subTpl = match[3];
    let subTplWithoutInnerRefPrefix = subTpl.replace(new RegExp(`{{ ${innerRef}\\.`, 'g'), '{{ ');
    let hydratedViewPart = subDatas.map((subData: ViewData) => {
      return this.replace(subTplWithoutInnerRefPrefix, subData);
    }).join('');
    viewTemplate = viewTemplate.replace(
      new RegExp(tpl, 'g'),
      hydratedViewPart
    );
    return viewTemplate;
  }

}

export default Mostachito;
