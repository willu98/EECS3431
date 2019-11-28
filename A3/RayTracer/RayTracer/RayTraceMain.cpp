// io/read-file-sum.cpp - Read integers from file and print sum.
// Fred Swartz 2003-08-20

#include <iostream>
#include <iomanip>
#include <fstream>
#include <string>
#include <list> 
using namespace std;


//coordinates of the near
float near;
float left1;
float right1;
float top;
float bottom;

//resolution of the image
int resolution[2];


//structure for a sphere
struct sphere {
	//name of the sphere
	string name;
	//position
	float position[3];
	//non-uniform scaling factor
	float scaling[3];
	//color of the obj/sphere(rgb format)
	float color[3];
	//coefficients for the sphere for the A.D.S model
	float kCoefficients[4];
	//exponent for the ads model
	int specularExp;
}; 

//list of sphere, as there could be any number of spheres in the scene
list <sphere> sphereObjects;

//structure for a light object
struct lightObj {
	//name of the light object
	string name;

	//light position for point source light
	float posLight[3];
	//intensity of point source light
	float intensityLight[3];
};
//list of light objects as there could be any number of light objects int he scene
list <lightObj> lightObjects;

//background color
float backColor[3];

//scene's ambient intensity
float ambientIntensity[3];

//the file that is to be output
string outputFile;


int main()
{
	ifstream inFile("../../Project3TestsAndKeys/testParsing1.txt");
	string newLine;
	string keyWord;
	while (inFile)
	{
		//reading the file line by line
		getline(inFile, newLine);

		//getting the first word in the line, ie the key word
		keyWord = newLine.substr(0, newLine.find(" "));;

		//removing keyword from the string
		newLine = newLine.substr(newLine.find(" ") + 1, newLine.size());
		string token; 

		//if near is the keyword that is found
		if ((keyWord.compare("NEAR")) == 0) {

			//while there is white space at the front, continue to remove
			while (newLine[0] == ' ') {
				//getting the substring without the white space at the front
				newLine = newLine.substr(1, newLine.size());
			}

			//getting the first number inline
			token = newLine.substr(0, newLine.find(" "));
			near = std::stof(token);
			cout << near << endl;
		}
		
		if ((keyWord.compare("LEFT")) == 0) {
			//while there is white space at the front, continue to remove
			while (newLine[0] == ' ') {
				//getting the substring without the white space at the front
				newLine = newLine.substr(1, newLine.size());
			}

			//getting the first number inline
			token = newLine.substr(0, newLine.find(" "));
			left1 = std::stof(token);
			cout << left1 << endl;
		}
		if ((keyWord.compare("RIGHT")) == 0) {
			//while there is white space at the front, continue to remove
			while (newLine[0] == ' ') {
				//getting the substring without the white space at the front
				newLine = newLine.substr(1, newLine.size());
			}

			//getting the first number inline
			token = newLine.substr(0, newLine.find(" "));
			right1 = std::stof(token);
			cout << right1 << endl;
		}
		if ((keyWord.compare("BOTTOM")) == 0) {
			//while there is white space at the front, continue to remove
			while (newLine[0] == ' ') {
				//getting the substring without the white space at the front
				newLine = newLine.substr(1, newLine.size());
			}

			//getting the first number inline
			token = newLine.substr(0, newLine.find(" "));
			bottom = std::stof(token);
			cout << bottom << endl;
		}
		if ((keyWord.compare("TOP")) == 0) {
			//while there is white space at the front, continue to remove
			while (newLine[0] == ' ') {
				//getting the substring without the white space at the front
				newLine = newLine.substr(1, newLine.size());
			}

			//getting the first number inline
			token = newLine.substr(0, newLine.find(" "));
			top = std::stof(token);
			cout << top << endl;
		}
		if ((keyWord.compare("RES")) == 0) {
			for (int i = 0; i < 2; i++) {
				//while there is white space at the front, continue to remove
				while (newLine[0] == ' ') {
					//getting the substring without the white space at the front
					newLine = newLine.substr(1, newLine.size());
				}

				//getting the first number inline
				token = newLine.substr(0, newLine.find(" "));
				resolution[i] = std::stoi(token);
				if (i == 0) {
					//going to the next value
					newLine = newLine.substr(newLine.find(" "), newLine.size());
				}
				cout << resolution[i] << endl;
			}
		}
		if ((keyWord.compare("AMBIENT")) == 0) {
			for (int i = 0; i < 3; i++) {
				//while there is white space at the front, continue to remove
				while (newLine[0] == ' ') {
					//getting the substring without the white space at the front
					newLine = newLine.substr(1, newLine.size());
				}

				//getting the first number inline
				token = newLine.substr(0, newLine.find(" "));
				ambientIntensity[i] = std::stof(token);
				if (i < 2) {
					//going to the next value
					newLine = newLine.substr(newLine.find(" "), newLine.size());
				}
				cout << ambientIntensity[i] << endl;
			}
		}
		if ((keyWord.compare("BACK")) == 0) {
			for (int i = 0; i < 3; i++) {
				//while there is white space at the front, continue to remove
				while (newLine[0] == ' ') {
					//getting the substring without the white space at the front
					newLine = newLine.substr(1, newLine.size());
				}

				//getting the first number inline
				token = newLine.substr(0, newLine.find(" "));
				backColor[i] = std::stof(token);
				if (i < 2) {
					//going to the next value
					newLine = newLine.substr(newLine.find(" "), newLine.size());
				}
				cout << backColor[i] << endl;
			}
		}
		//IF SPHERE KEYWORD IS FOUND
		if ((keyWord.compare("SPHERE")) == 0) {
			//temporary sphere object to push into the list
			sphere tempSphere;
				
			//GETTING POSITION, COLOR AND SCALING FACTORS OF THE SPHERE
			for (int i = 0; i < 15; i++) {
				//while there is white space at the front, continue to remove
				while (newLine[0] == ' ') {
					//getting the substring without the white space at the front
					newLine = newLine.substr(1, newLine.size());
				}
				//SETTING the value number inline
				token = newLine.substr(0, newLine.find(" "));
				if (i == 0) {
					//SETTING the name of the sphere
					tempSphere.name = token;
					cout << tempSphere.name << endl;
				}
				//SETTING THE (X,Y,Z) POSITIONS OF THE SPHERE
				else if (i < 4) {
					tempSphere.position[i - 1] = std::stof(token);
					cout << tempSphere.position[i - 1] << endl;
				}
				//SETTING THE (X,Y,Z) SCALING FACTORS OF THE SPHERE
				else if (i < 7) {
					tempSphere.scaling[i - 4] = std::stof(token);
					cout << tempSphere.scaling[i - 4] << endl;
				}
				//SETTING THE (R,G,B) VALUES OF THE COLOR
				else if (i < 10) {
					tempSphere.color[i - 7] = std::stof(token);
					cout << tempSphere.color[i - 7] << endl;
				}
				//SETTING THE COEFFICIENTS FOR THE ADS MODEL
				else if (i < 14) {
					tempSphere.kCoefficients[i - 10] = std::stof(token);
					cout << tempSphere.kCoefficients[i - 10] << endl;
				}
				//SETTING THE SPECULAR EXPONENT VALUE
				else if (i == 14) {
					tempSphere.specularExp = std::stoi(token);
					cout << tempSphere.specularExp << endl;
				}


				if (i < 14) {
					//going to the next value only if not at the last part of the line
					newLine = newLine.substr(newLine.find(" "), newLine.size());
				}
			}

			//adding a sphere object to the list
			sphereObjects.push_back(tempSphere);

		}
		//IF SPHERE KEYWORD IS FOUND
		if ((keyWord.compare("LIGHT")) == 0) {
			//temporary sphere object to push into the list
			lightObj tempLight;

			//GETTING POSITION, COLOR AND SCALING FACTORS OF THE SPHERE
			for (int i = 0; i < 7; i++) {
				//while there is white space at the front, continue to remove
				while (newLine[0] == ' ') {
					//getting the substring without the white space at the front
					newLine = newLine.substr(1, newLine.size());
				}
				//SETTING the value number inline
				token = newLine.substr(0, newLine.find(" "));
				if (i == 0) {
					//SETTING the name of the sphere
					tempLight.name = token;
					cout << tempLight.name << endl;
				}
				//SETTING THE (X,Y,Z) POSITIONS OF THE SPHERE
				else if (i < 4) {
					tempLight.posLight[i - 1] = std::stof(token);
					cout << tempLight.posLight[i - 1] << endl;
				}
				//SETTING THE (X,Y,Z) SCALING FACTORS OF THE SPHERE
				else if (i < 7) {
					tempLight.intensityLight[i - 4] = std::stof(token);
					cout << tempLight.intensityLight[i - 4] << endl;
				}

				if (i < 6) {
					//going to the next value only if not at the last part of the line
					newLine = newLine.substr(newLine.find(" "), newLine.size());
				}
			}

			//adding a sphere object to the list
			lightObjects.push_back(tempLight);

		}
		if ((keyWord.compare("OUTPUT")) == 0) {
			//while there is white space at the front, continue to remove
			while (newLine[0] == '\n') {
				//getting the substring without the white space at the front
				newLine = newLine.substr(1, newLine.size());
				cout << "YEET" << endl;

			}
			//SETTING the value number inline
			token = newLine.substr(0, newLine.find(" "));
			//SETTING the name of the output file
			outputFile = token;
			cout << outputFile << endl;
		}

		//cout << keyWord << endl;


	}

	inFile.close();

	return 0;
}

