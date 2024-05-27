import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

// const getToken = Cookies.get('token');

 const getToken = 'j%3A%7B%22token%22%3A%22eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbXBsb3llZU5vIjoiU1BBTi1CTFItMjI3MyIsIm5hbWUiOiJBYXNoaXNoIFJhbmphbiBKaGEiLCJpc0FkbWluIjp0cnVlLCJlbWFpbCI6ImFhc2hpc2hqQHNwYW5pZGVhLmNvbSIsInBvcnRhbEFjY2VzcyI6W3sicm9sZU5hbWUiOiJBZG1pbiIsInBvcnRhbE5hbWUiOiJDTVMifSx7InJvbGVOYW1lIjoiVXBkYXRlIiwicG9ydGFsTmFtZSI6Ik1FRVRJTkcgUk9PTSJ9LHsicm9sZU5hbWUiOiJWaWV3IiwicG9ydGFsTmFtZSI6Ik1FRVRJTkcgUk9PTSJ9LHsicm9sZU5hbWUiOiJBZG1pbiIsInBvcnRhbE5hbWUiOiJUSU1FIFNIRUVUIn0seyJyb2xlTmFtZSI6IkFkbWluIiwicG9ydGFsTmFtZSI6IkFETUlOIn1dLCJpYXQiOjE3MTY0NDIwNzUsImV4cCI6MTcxNjUyODQ3NX0.jt4rdY0IdApjqnxhSHO1rhHaP9x2QQBlToSZg9LAXv0%22%2C%22isAdmin%22%3Atrue%7D'
// moniska'j%3A%7B%22token%22%3A%22eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbXBsb3llZU5vIjoiU1BBTi1CTFItMDAwMCIsIm5hbWUiOiJNb25pc2thIiwiaXNBZG1pbiI6ZmFsc2UsImVtYWlsIjoibXBAc3BhbmlkZWEuY29tIiwicG9ydGFsQWNjZXNzIjpbeyJyb2xlTmFtZSI6IlVwZGF0ZSIsInBvcnRhbE5hbWUiOiJDTVMifSx7InJvbGVOYW1lIjoiVmlldyIsInBvcnRhbE5hbWUiOiJNRUVUSU5HIFJPT00ifV0sImlhdCI6MTcxNjQ0MTg2MCwiZXhwIjoxNzE2NTI4MjYwfQ.Ouw9KryHuUrhjFgFyJxahnsw4VZXLwILMMJy2BItzgk%22%2C%22isAdmin%22%3Afalse%7D'


  if (!getToken) {
  window.location.href = 'https://stagingapps.spanidea.com/login';
}

try {
  const decodedToken = jwtDecode(
    getToken,
    process.env.REACT_APP_JWT_SECRET_KEY
  );
  console.log('decodedToken', decodedToken);

  const listOfPortalName = decodedToken.portalAccess;

  var roleName = '';

  // listOfPortalName.forEach((rName, i) => {
  //   if (rName.portalName === 'CMS') {
  //     return (roleName = rName.roleName);
  //   }
  // });

  if ( !decodedToken?.isAdmin && listOfPortalName[0].portalName !== 'CMS') {
    window.location.href = 'http://stagingapps.spanidea.com/login';
  } else {
    roleName = listOfPortalName[0].roleName;
  } 
  
} catch (error) {
  window.location.href = 'https://stagingapps.spanidea.com/login';
}

const GetRole = () => {
  if (roleName === 'Admin') {
    return 'admin';
  }
  if (roleName === 'Update') {
    return 'bdTeam';
  }
  if (roleName === 'View') {
    return 'finance';
  }
};
export default GetRole;
