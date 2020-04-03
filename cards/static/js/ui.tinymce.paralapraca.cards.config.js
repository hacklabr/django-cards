(function(angular){
    'use strict';

    var app = angular.module('ui.tinymce');

    // If you want to cutomize uiTinymceConfig for your theme, please copy this file to you theme in the
    // same path (static/js/). This are the default setting for timtec
    app.value('uiTinymceConfig', {
        base_url: 'https://unpkg.com/tinymce@4.5.10',
        related_url: true,
        inline: false,
        menubar: false,
        relative_urls: false,
        remove_script_host: false,
        paste_as_text: true,
        plugins: 'advlist lists autolink link autoresize paste',
        toolbar: 'bold italic | bullist numlist | quicklink link fullscreen | removeformat',
        skin: 'lightgray',
        theme : 'modern',
        language: 'pt_BR',
        language_url : 'https://unpkg.com/tinymce-i18n@19.4.15/langs/pt_BR.js',
        resize: true,
        elementpath: false,

        formats: {
          removeformat: [
            {selector: 'b,strong,em,i,font,u,strike', remove : 'all', split : true, expand : false, block_expand: true, deep : true},
            {selector: 'h1,h2,h3,h4,h5,h6', remove : 'all', split : true, expand : false, block_expand: false, deep : true},
            {selector: 'span', attributes : ['style', 'class'], remove : 'empty', split : true, expand : false, deep : true},
            {selector: '*', attributes : ['style', 'class'], split : false, expand : false, deep : true}
          ]
        }
    });

})(window.angular);
