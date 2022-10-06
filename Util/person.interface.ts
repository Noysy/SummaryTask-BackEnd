interface IPerson {
  name: string;
  favoriteColor: string;
  favoriteAnimal: string;
  favoriteFood: string;
  role: string;
  group?: string;
  files?: FileDetails[];
  id: string;
}

interface FileDetails {
  name: string;
  url: string;
}

export default IPerson ;
