///<reference path="../typings/globals/jasmine/index.d.ts"/>
///<reference path="renuo_upload.ts"/>

describe('ContentBlockDrawer', function () {
  const upload = RenuoUpload;

  it('draws simple text', function () {
    expect(upload).toBeTruthy();
    expect(true).toBeTruthy();
  });
});
