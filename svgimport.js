// EasyEDA: Advanced -> Extensions -> Load Script / Run Script


var svgImportScale = 1;
var svgImportAs = 'svg';
var svgImportOffsetX = 0;
var svgImportOffsetY = 0;
var svgDocument = '';
var svgPaths = [];
var svgImportLayer = 1;


function newId() {
    return "cgge"+Math.floor(Math.random() * 9e6);
}


function getOffsets() {
    console.log('getOffsets');
    let s = api('getSource', {type: "json"});
    console.log(s);
    svgImportOffsetX = s.canvas.originX;
    svgImportOffsetY = s.canvas.originY;
    document.querySelector('#import-origin-x').value = svgImportOffsetX;
    document.querySelector('#import-origin-y').value = svgImportOffsetY;
}


function updateLayerOptions() {
    let el = document.querySelector('#import-layer');
    let oldValue = el.value;
    let s = api('getSource', {type: "json"});
    while(e=el.firstChild) el.removeChild(e); // remove all options
    let layers = Object.keys(s.layers).map( k => { let l = s.layers[k]; l.key=k; return l; } ).filter( l => l.visible);
    layers.forEach( layer => {
        el.insertAdjacentHTML("beforeend",`<option value="${layer.key}">${layer.key} - ${layer.name}</option>`);
    });
}

function offsetsChange() {
    console.log('offsetsChange');
    svgImportOffsetX = Number(document.querySelector('#import-origin-x').value);
    svgImportOffsetY = Number(document.querySelector('#import-origin-y').value);
    document.querySelector('#import-origin-x').value = svgImportOffsetX;
    document.querySelector('#import-origin-y').value = svgImportOffsetY;
}

function importAsClick() {
    svgImportAs = 'solid';
    if(document.querySelector('#import-as-svg').checked) svgImportAs = 'svg';
}

function addSolidRegion(code) {
    let iid = newId();
    let s = api('getSource', {type: "json"});
    if(s.SOLIDREGION=== undefined) s.SOLIDREGION = {};
    s.SOLIDREGION["iid"] = { gId: iid, layerid: `${svgImportLayer}`, pathStr: code, type: "solid"};
    api('applySource', {source: s, createNew: !true});
}
   

function addSVGNode(code) {
    let iid = newId();
    let s = api('getSource', {type: "json"});
    if(s.SVGNODE === undefined) s.SVGNODE = {};
    s.SVGNODE[iid] = { 
     gId: iid, 
     layerid: `${svgImportLayer}`, 
     nodeName: "path",
     nodeType: 1,
     attrs: {
      d: code,
      id: iid, 
      layerid: `${svgImportLayer}`,
      stroke: "none"
     }
    };
    api('applySource', {source: s, createNew: !true});
}


function loadSVGData() {
    const regexp = /<path[^>]*[^a-z]d="([^"]+)"/g;
    var paths = [...svgDocument.matchAll(regexp)].map((e) => reparseSVGPath(e[1]));
    console.log(paths);
    svgPaths = paths;
}

function importSVGClick() {
    loadSVGData();
    svgPaths.forEach(element => {
        if(svgImportAs == 'svg') addSVGNode(element);
        if(svgImportAs == 'solid') addSolidRegion(element);
    });
    
}

function reparseSVGPath(pathData) {
    const regexp = /[^0-9a-zA-Z-\.]+/g;
    pathData = pathData.replaceAll(regexp,' ').trim();

    var c = pathData.split(' ');
    var idx = 0;
    var cx = 0;
    var cx = 0;
    var zx = 0;
    var zy = 0;
    var k1x = k1y = k2x = k2y = 0;
    var sx = svgImportScale;
    var sy = svgImportScale;
    var ox = svgImportOffsetX;
    var oy = svgImportOffsetY;
    var o = Array();

    console.log(`Importing scale ${svgImportScale}, Offset (${svgImportOffsetX},${svgImportOffsetY})`);

    // Parsing the SVG. Converting all relative commands to absolute and stripping commands not supported!
    while(idx < c.length) {
        if(c[idx] == 'M') {
            cx = zx = Number(c[idx+1]);
            cy = zy = Number(c[idx+2]);
            idx += 2;
            o = [...o, 'M', cx*sx+ox, cy*sy+oy];
        }
        if(c[idx] == 'm') {
            cx = zx += Number(c[idx+1]);
            cy = zy += Number(c[idx+2]);
            idx += 2;
            o = [...o, 'M', cx*sx+ox, cy*sy+oy];
        }
        if(c[idx] == 'z' || c[idx] == 'Z') {
            o = [...o, 'L', zx*sx+ox, zy*sy+oy];
        }
        if(c[idx] == 'L') {
            cx = Number(c[idx+1]);
            cy = Number(c[idx+2]);
            idx += 2;
            o = [...o, 'L', cx*sx+ox, cy*sy+oy];            
        }
        if(c[idx] == 'l') {
            cx += Number(c[idx+1]);
            cy += Number(c[idx+2]);
            idx += 2;
            o = [...o, 'L', cx*sx+ox, cy*sy+oy];
        }
        if(c[idx] == 'H') {
            cx = Number(c[idx+1]);
            idx += 1;
            o = [...o, 'L', cx*sx+ox, cy*sy+oy];            
        }
        if(c[idx] == 'h') {
            cx += Number(c[idx+1]);
            idx += 1;
            o = [...o, 'L', cx*sx+ox, cy*sy+oy];            
        }
        if(c[idx] == 'V') {
            cy = Number(c[idx+1]);
            idx += 1;
            o = [...o, 'L', cx*sx+ox, cy*sy+oy];            
        }
        if(c[idx] == 'v') {
            cy += Number(c[idx+1]);
            idx += 1;
            o = [...o, 'L', cx*sx+ox, cy*sy+oy];            
        }
        if(c[idx] == 'Q') {
            k1x = Number(c[++idx]);
            k1y = Number(c[++idx]);
            cx = Number(c[++idx]);
            cy = Number(c[++idx]);
            o = [...o, 'Q', k1x*sx+ox, k1y*sy+oy, cx*sx+ox, cy*sy+oy];
        }
        if(c[idx] == 'q') {
            k1x = cx + Number(c[++idx]);
            k1y = cy + Number(c[++idx]);
            cx += Number(c[++idx]);
            cy += Number(c[++idx]);
            o = [...o, 'Q', k1x*sx+ox, k1y*sy+oy, cx*sx+ox, cy*sy+oy];
        }
        if(c[idx] == 'C') {
            k1x = Number(c[++idx]);
            k1y = Number(c[++idx]);
            k2x = Number(c[++idx]);
            k2y = Number(c[++idx]);
            cx = Number(c[++idx]);
            cy = Number(c[++idx]);
            o = [...o, 'C', k1x*sx+ox, k1y*sy+oy, k2x*sx+ox, k2y*sy+oy, cx*sx+ox, cy*sy+oy];
            // calculate next k1x/k1y for following S
            k1x = cx + (cx-k2x);
            k1y = cy + (cy-k2y);
        }
        if(c[idx] == 'c') {
            k1x = cx + Number(c[++idx]);
            k1y = cy + Number(c[++idx]);
            k2x = cx + Number(c[++idx]);
            k2y = cy + Number(c[++idx]);
            cx += Number(c[++idx]);
            cy += Number(c[++idx]);
            o = [...o, 'C', k1x*sx+ox, k1y*sy+oy, k2x*sx+ox, k2y*sy+oy, cx*sx+ox, cy*sy+oy];
            // calculate next k1x/k1y for following S
            k1x = cx + (cx-k2x);
            k1y = cy + (cy-k2y);
        }
        if(c[idx] == 'S') {
            k2x = Number(c[++idx]);
            k2y = Number(c[++idx]);
            cx = Number(c[++idx]);
            cy = Number(c[++idx]);
            o = [...o, 'C', k1x*sx+ox, k1y*sy+oy, k2x*sx+ox, k2y*sy+oy, cx*sx+ox, cy*sy+oy];
        }
        if(c[idx] == 's') {
            k2x = cx + Number(c[++idx]);
            k2y = cy + Number(c[++idx]);
            cx += Number(c[++idx]);
            cy += Number(c[++idx]);
            o = [...o, 'C', k1x*sx+ox, k1y*sy+oy, k2x*sx+ox, k2y*sy+oy, cx*sx+ox, cy*sy+oy];
        }
        idx++;
    }

    return o.join(' ');
}

function initForm() {
    // reset Panel
    while(el = document.querySelector('#svgImportPanel')) el.remove();
    while(el = document.querySelector('#dlgImportSVG')) el.remove();

    document.querySelector('body').insertAdjacentHTML("beforeend",`
    
    <div id="svgImportPanel" class="panel window" style="display: block; left: 10vw; top: 10vh; width: 400px; z-index: 9019; position: absolute;">
        <div class="panel-header panel-header-noborder window-header" style="">
            <div class="panel-title i18n" i18n="Script" style="cursor: move;">SVG Import</div>
            <div class="panel-tool">
                <div class="panel-tool-close"></div>
                <div class="panel-tool-collapse"></div>
            </div>
        </div>
        <div id="dlgImportSVG" class="easyui-dialog panel-body panel-body-noborder window-body" style="overflow: hidden; display: block;">
            <div class="panel" style="left: 0px; top: 0px; display: block;">
                <div class="dialog-content panel-body panel-body-noheader panel-body-noborder" style="padding: 0px;" title="">
                    <div style="margin:4px 0 4px 10px">
                        <a data-field="selectfile" href="#" class="easyui-linkbutton l-btn"><span class="l-btn-left"><span class="l-btn-text i18n" i18n="Load svg file...">Load svg file</span></span></a>
                        <input type="file" accept=".svg,.xml" style="display:none">
                    </div>
                    <div style="text-align:center; display: none;">
                        <textarea data-field="content" spellcheck="false" style="width: 90%; height: 80px;"></textarea>
                    </div>
                    <fieldset>
                        <legend>Import as</legend>
                        <div><input type="radio" name="import-as" id="import-as-svg" value="svg" checked="checked"><label for="import-as-svg">SVG Node (copper, soldermask, silk, document)</label></div>
                        <div><input type="radio" name="import-as" id="import-as-solid" value="solid"><label for="import-as-solid">Solid region (copper fill / keepout, board cutout)</label></div>
                    </fieldset>
                    <fieldset>
                        <legend>Import scale (EasyEDA base unit is 1/10 inch)</legend>
                        <div>
                            <input type="number" step="any" name="import-scale" id="import-scale" value="1" size="4" style="width:8em">
                            <a class="l-btn" id="btn-scale-mil"><span class="l-btn-left"><span class="l-btn-text">mil</span></span></a>
                            <a class="l-btn" id="btn-scale-in"><span class="l-btn-left"><span class="l-btn-text">inch</span></span></a>
                            <a class="l-btn" id="btn-scale-mm"><span class="l-btn-left"><span class="l-btn-text">mm</span></span></a>
                        </div>
                    </fieldset>
                    <fieldset>
                        <legend>Import origin (svg origin will be placed here)</legend>
                        <div>
                            <input type="number" step="any" name="import-origin-x" id="import-origin-x" value="0" size="5" style="width:5em">
                            <input type="number" step="any" name="import-origin-y" id="import-origin-y" value="0" size="5" style="width:5em">
                            <a class="l-btn" id="btn-get-offsets"><span class="l-btn-left"><span class="l-btn-text">Editor Origin</span></span></a>
                        </div>
                    </fieldset>
                    <fieldset>
                        <legend>Import Layer</legend>
                        <div>
                            <select name="import-layer" id="import-layer">
                                <option value="0">none</option>
                            </select>
                        </div>
                    </fieldset>
                </div>
            </div>
            <div class="dialog-button">
                <a tabindex="0" cmd="import" class="l-btn" style=""><span class="l-btn-left"><span class="l-btn-text i18n" i18n="Import">Import</span></span></a>
                <a tabindex="0" cmd="dialog-close" class="l-btn"><span class="l-btn-left"><span class="l-btn-text i18n" i18n="Cancel">Cancel</span></span></a>
            </div>
        </div>
    </div>

    `);
    var dlgImportSVG = document.querySelector('#dlgImportSVG');
    var svgImportPanel = document.querySelector('#svgImportPanel');
    document.querySelector('#svgImportPanel .panel-tool-collapse').addEventListener('click',()=>{ dlgImportSVG.style.height = '0px'; });
    document.querySelector('#svgImportPanel .panel-tool-close').addEventListener('click',()=>{ svgImportPanel.remove(); });
    document.querySelector('#svgImportPanel a[cmd=dialog-close]').addEventListener('click',()=>{ svgImportPanel.remove(); });
    document.querySelector('#svgImportPanel a[cmd=import]').addEventListener('click',importSVGClick);
    document.querySelector('#btn-get-offsets').addEventListener('click',getOffsets);
    document.querySelector('#import-as-svg').addEventListener('change',importAsClick);
    document.querySelector('#import-as-solid').addEventListener('change',importAsClick);
    document.querySelector('#import-origin-x').addEventListener('change',offsetsChange);
    document.querySelector('#import-origin-y').addEventListener('change',offsetsChange);
    var fileInput = document.querySelector('#svgImportPanel input[type=file]');
    fileInput.addEventListener('change', function() {
        var file = fileInput.files[0];    
        if (file.name.match(/\.(txt|json|svg|xml)$/)) {
            var reader = new FileReader();    
            reader.onload = function() {
                svgDocument = reader.result;
                document.querySelector('#svgImportPanel textarea').value = svgDocument;
            };    
            reader.readAsText(file);
        } else {
            alert("File not supported, .txt or .json files only");
        }
    });
    document.querySelector('#svgImportPanel a[data-field=selectfile]').addEventListener('click',()=>{ fileInput.click(); });
    document.querySelector('#import-scale').addEventListener('change',(e)=>{ 
        console.log(e);
        svgImportScale = Number(e.target.value);
        console.log(svgImportScale);
    });

    document.querySelector('#import-layer').addEventListener('change',(e)=>{ 
        console.log(e);
        svgImportLayer = Number(e.target.value);
    });
    
    document.querySelector('#btn-scale-in').addEventListener('click',(e)=> {
        svgImportScale = 10;
        document.querySelector('#import-scale').value = svgImportScale;
    });
    document.querySelector('#btn-scale-mil').addEventListener('click',(e)=> {
        svgImportScale = 0.01;
        document.querySelector('#import-scale').value = svgImportScale;
    });
    document.querySelector('#btn-scale-mm').addEventListener('click',(e)=> {
        svgImportScale = 3.937; // 10/2.54
        document.querySelector('#import-scale').value = svgImportScale;
    });
    
    getOffsets();
    updateLayerOptions();
}

initForm();