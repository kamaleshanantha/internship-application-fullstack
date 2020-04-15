// Initializing constants used
const variantAPI = 'https://cfw-takehome.developers.workers.dev/api/variants'
const linkedInURL = 'https://www.linkedin.com/in/kamaleshap/'
const githubUrl = 'https://www.github.com/kamaleshanantha/'

/**
 * Event listener for pageload
 *  
 * */
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

/**
 * Respond to the request.
 * Uses cookie to persist initial variant of the url selected
 * @param {Request} request
 */
async function handleRequest(request) {
  //Fetch urls from the intial variants api
  let initialResponse = await fetch(variantAPI)
  let responseBody = await initialResponse.json()

  //check if request cookie is available and use the value of the index
  let reqCookie = request.headers.get('Cookie')

  //if request is without cookie, assign a random index as the urlIndex
  if (reqCookie) {
    urlIndex = parseInt(getCookieValue(reqCookie, 'urlIndex'))
    console.log("reqCookie: ", urlIndex)
  } else {
    urlIndex = Math.floor(Math.random() * responseBody.variants.length)
  }

  // Fetch the response from the url inside the URL array using the index
  let childResponse = await fetch(responseBody.variants[urlIndex])

  // rewrite the HTML response with custom modifications
  newResponse = rewriter.transform(childResponse)


  // persist the urlIndex as cookie and send along as response if request cookie is empty
  // set expiry of cookie to 15 minutes
  var now = new Date();
  now.setTime(now.getTime() + 900 * 1000);
  const respCookie = `urlIndex=${urlIndex}; expires=${now} `

  if (!reqCookie)
    newResponse.headers.set('Set-Cookie', respCookie)

  //return the response  
  return newResponse

}


/**
 *  Using the AttributeRewriter class to set custom values to elements
 * */
class AttributeRewriter {

  constructor(attributeName) {
    this.attributeName = attributeName
  }

  element(element) {
    if (element.tagName == 'a') {
      const attribute = element.getAttribute(this.attributeName)
      switch (urlIndex) {
        case 0: {
          element.setInnerContent('Visit My LinkedIN Profile')
          if (attribute) {
            element.setAttribute(
              this.attributeName,
              attribute.replace('https://cloudflare.com', linkedInURL)
            )
          }
        }
          break;
        case 1: {
          element.setInnerContent('Visit My GitHub Profile')
          if (attribute) {
            element.setAttribute(
              this.attributeName,
              attribute.replace('https://cloudflare.com', githubUrl)
            )
          }
        }
          break;
        default:
      }
    }

    if (element.tagName == 'h1') {
      element.setInnerContent('Kamalesh Anantha Padmanabhan')
    }

    if (element.tagName == 'p') {
      switch (urlIndex) {
        case 0:
          element.setInnerContent('This button will take you to my LinkedIN page')
          break;
        case 1:
          element.setInnerContent('This button will take you to my GitHub page')
          break;
        default:

      }
    }

  }

}

// variable to hold the index of the URL
var urlIndex

//Initializing rewriter
const rewriter = new HTMLRewriter()
  .on('a', new AttributeRewriter('href'))
  .on('h1', new AttributeRewriter('title'))
  .on('p', new AttributeRewriter('description'))

/**
 * Util method to parse value of key from cookie
 * @param {*} cookie 
 * @param {*} key 
 */
function getCookieValue(cookie, key) {
  var b = cookie.match('(^|[^;]+)\\s*' + key + '\\s*=\\s*([^;]+)');
  return b ? b.pop() : '';
}
