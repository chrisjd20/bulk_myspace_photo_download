// ==UserScript==
// @name         MySpace Mix File Photo Downloader
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Bulk Download of all Myspace Mix Photos from your old profile
// @author       Christopher Davis
// @match        https://myspace.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    var last_url = '';
    //Removes duplicate images from array
    function removeDuplicates(arr){
        let unique_array = [];
        for(let i = 0;i < arr.length; i++){
            if(unique_array.indexOf(arr[i]) == -1){
                unique_array.push(arr[i]);
            }
        }
        return unique_array;
    }
    //Checks if the arrays are equal
    function arraysEqual(a, b) {
        if (a === b) return true;
        if (a == null || b == null) return false;
        if (a.length != b.length) return false;
        for (var i = 0; i < a.length; ++i) {
          if (a[i] !== b[i]) return false;
        }
        return true;
      }
    function load_pics(num_of_images) {
        //Scroll left once more to make sure the page has loaded ALLLLL of our images
        $("#parallax").animate({scrollLeft: 999999999}, 2000, function(){
            var tmp_array = [];
            var elements = $('img[itemprop="image"]');
            for (var i = 0; i < elements.length; i++) {
                tmp_array.push(elements[i].currentSrc);
            }
            tmp_array = removeDuplicates(tmp_array).sort();
            //If NO new images have been loaded, then lets move on to make our images page
            if (arraysEqual(num_of_images, tmp_array)) {
                var image_src_array = [];
                $.each($('img[itemprop="image"]'), function( index, value ) {
                    //We want to iterate over the image sources and change them to their full resolution
                    var image_full = value.currentSrc.replace(/\d\d\d?x\d\d\d?\.jpg/g, 'full.jpg');
                    image_src_array.push(image_full);
                    image_src_array = removeDuplicates(image_src_array);
                    if (index + 1 === $('img[itemprop="image"]').length) {
                        //building our html
                        var html = '<body><h3 style="text-align: center;">Right Click Somewhere on this window (though not an image) and Click "Save As..." To Save All Pics</h3>';
                        for (var i = 0; i < image_src_array.length; i++) {
                            html += '<img src="'+image_src_array[i]+'" style="display: inline-block;" onerror="this.parentNode.removeChild(this)"></img>';
                            if (i + 1 === image_src_array.length) {
                                html += '</body>';
                                //Create our download button with the html source embedded
                                $('body').append('<a id="download_all" style="background-color:red; text-align: center; font-size: 20px; color: white; z-index: 9999; position: fixed; top:0; left:0; height: 70px; width:280px;" target="_blank" href="data:text\/html;charset=utf-8,' + encodeURI(html)+'" >Right-Click Here and Open in New Tab to Download All Myspace pics!</a>');
                            }
                        }
                    }
                });
            } else {
                //else if new images HAVE been loaded then lets recurse back into our function and try to load some more
                $("#parallax").animate({scrollLeft: -100}, 0);
                load_pics( tmp_array );
            }
        });
    };
    //Once the page is ready, lets start here
    $(document).ready(function() {
        //Set Interval to check the url if its a mixes page with image basically to track if the user changes the page to a mix with photos
        setInterval( function(){
            //Dont want to keep regenerating the code unless we have to so dont do it id its the same url
            if (last_url !== document.location.href) {
                last_url = document.location.href+'';
                //If its a mix url on myspace with our photos
                if (/https\:\/\/myspace\.com\/.+?\/mixes\/.+?/.test(document.location.href)) {
                    //Myspace mix pages load more pictures as users scroll right. Lets trigger our scrolling
                    $("#parallax").animate({scrollLeft: 999999999}, 1000);
                    $("#parallax").animate({scrollLeft: -100}, 0);
                    //If button doesnt exist
                    if (!$('#download_all').length) {
                        var tmp_array = [];
                        //Lets grab all of our images here
                        var elements = $('img[itemprop="image"]');
                        for (var i = 0; i < elements.length; i++) {
                            tmp_array.push(elements[i].currentSrc);
                            if (i+1 == elements.length) {
                                //Once all the images have been collected, lets send it to load the pics
                                load_pics( removeDuplicates(tmp_array).sort() );
                            }
                        }
                    }
                } else {
                    //REmove the download button if we arent on a mix page
                    if ($('#download_all').length) {
                        $('#download_all').remove();
                    }
                }
            }
        }, 200);
    });
})();
