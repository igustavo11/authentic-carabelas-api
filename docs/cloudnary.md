# JavaScript SDK image and video upload



When using the JavaScript SDK, you can use one of several options to upload files directly to Cloudinary without the need for server-side operations or authentication signatures.

## Upload options

### Upload widget

The [Upload widget](upload_widget) is a ready-made, responsive user interface that enables your users to upload files from a variety of sources directly to Cloudinary. You can customize and embed this UI within your web application with just a few lines of code. 

Check out the following [Upload Widget code explorer](https://stackblitz.com/edit/github-vt6fzc-wms1nc) that you can fork to try out some sample configuration changes:

> **NOTE**: Due to CORS issues with StackBlitz, you may have errors opening the widget with the preview. Try opening the preview in a new tab to resolve this or use the GitHub link below to run locally.

This code is also available in [GitHub](https://github.com/cloudinary-devs/cloudinary-upload-widget-js).
### Upload endpoint

The [upload endpoint](image_upload_api_reference#upload) is `https://api.cloudinary.com/v1_1/${cloudName}/upload`. To use the endpoint in your application, use the [JavaScript Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/fetch) to call the Cloudinary `upload` endpoint and pass: 

* an **unsigned** [upload preset](upload_presets) with the [upload method options](image_upload_api_reference#upload) you want to apply for all files
* the file(s) to upload
* other [unsigned upload parameters](image_upload_api_reference#unsigned_upload_parameters) to apply to the selected files (e.g. `tags`, if needed).

> **NOTES**:
>
> * Each of the upload options described above can also be performed as a signed upload, but in this case, an authentication signature must be generated on your backend server. This can be implemented in conjunction with one of Cloudinary's [backend SDKs](cloudinary_sdks), which implement helpers to [automatically generate the authentication signature](authentication_signatures#using_cloudinary_backend_sdks_to_generate_sha_authentication_signatures) for the upload. 

> * If you are using jQuery in your app, you can take advantage of the [built-in upload functionality in Cloudinary's jQuery SDK](jquery_image_and_video_upload#direct_uploading_from_the_browser). This solution uses HTML5 cross-origin resource sharing (CORS) and gracefully degrades to a seamless iframe based solution for older browsers.

## Code examples
* **Code sample:** Implement the [upload widget](upload_widget#quick_example).
* **Code explorer:** [Upload multiple files using a form](client_side_uploading#code_explorer_upload_multiple_files_using_a_form_unsigned) in pure JavaScript using the Cloudinary upload endpoint.
* **CodePen:** [Use the JavaScript Fetch API to upload files](https://codepen.io/team/Cloudinary/pen/OJreJmz) in vanilla JavaScript using the Cloudinary upload endpoint for unsigned uploading with an upload preset. 
* **Sample project:** [Perform signed uploads from the browser](client_side_uploading#sample_project_upload_multiple_files_using_a_form_signed) by generating a signature on the server.* **Git sample project:** Upload files using the Upload Widget and the REST API in the [Photo Album](https://github.com/cloudinary-devs/javascript-photo-album) sample project.
> **TIP**: Enjoy interactive learning? Check out more [code explorers](code_explorers)!