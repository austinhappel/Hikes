import os
import json
import pystache

CWD = os.getcwd()
template = open(os.path.join(CWD, 'template.html')).read()
output_file = open(os.path.join(CWD, 'index.html'), 'w')
HIKES_FOLDER = os.path.join(CWD, 'hikes')

hike_list = []
root_folders = []

# generate list of root folders (sans .DS_Store's)
for folder in os.listdir(HIKES_FOLDER):
    if os.path.isdir(os.path.join(HIKES_FOLDER, folder)):
        root_folders.append(folder)

for idx, folder in enumerate(root_folders):

    hike_list.append({
        "year": folder,
        "hikes": []
    })    

    for hike in os.listdir(os.path.join(HIKES_FOLDER, folder)):
        if os.path.isdir(os.path.join(HIKES_FOLDER, folder, hike)):
            try:
                metadata_file = open(os.path.join(HIKES_FOLDER, folder, hike, 'metadata.json'), 'r')
            except IOError:
                metadata_file = False

            if metadata_file is not False:
                metadata = json.loads(metadata_file.read())
            else:
                metadata = False
            
            # every folder should have metadata
            if metadata is not False:
                name = metadata['name']

                # downloads are optional in the metadata.json file
                if 'downloads' in metadata:
                    downloads = []
                    for download in metadata['downloads']:
                        downloads.append({
                            "name": download['name'],
                            "download": os.path.join('hikes', folder, hike, download['path'])
                        })
                elif os.path.exists(os.path.join(HIKES_FOLDER, folder, hike, str(hike + '-raw.gpx'))):
                    downloads = [{
                        "name": str(hike + '-raw.gpx'),
                        "path": os.path.join('hikes', folder, hike, str(hike + '-raw.gpx'))
                    }]
                else:
                    downloads = []

                # path is required, we check for it later.
                if os.path.exists(os.path.join(HIKES_FOLDER, folder, hike, str(hike + '-all.geojson'))):
                    geojson_path = os.path.join('hikes', folder, hike, str(hike + '-all.geojson'))
                else:
                    geojson_path = False
            else:
                name = hike

            # create the hike data
            if geojson_path is not False:
                hike_list[idx]['hikes'].append({
                    "name": name,
                    "downloads": downloads,
                    "geojson_path": geojson_path
                    })
            else:
                print('hike: {} was not added, no geojson'.format(name))



# For this folder naming convention, folders are ordered oldest to newest.
# Here we reverse that to sho the newest first.
hike_list.reverse()
for hikes in hike_list:
    hikes['hikes'].reverse()

# pass the hike data to the template and write to the file.
output_file.write(pystache.render(template, hike_list).encode('utf-8'))
output_file.close()
