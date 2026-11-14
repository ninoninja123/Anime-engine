import json,struct,sys
for f in sys.argv[1:]:
    b=open(f,'rb').read(); n=struct.unpack('<I',b[12:16])[0]; j=json.loads(b[20:20+n])
    ext=j.get('extensions',{}); out={}
    if 'VRM' in ext:
        m=ext['VRM'].get('meta',{}); out={k:m.get(k) for k in('title','author','allowedUserName','violentUssageName','sexualUssageName','commercialUssageName','licenseName','otherLicenseUrl','otherPermissionUrl')}
        ver='VRM0'; bs=[g.get('presetName')+':'+g.get('name','') for g in ext['VRM'].get('blendShapeMaster',{}).get('blendShapeGroups',[])]
    elif 'VRMC_vrm' in ext:
        m=ext['VRMC_vrm'].get('meta',{}); out={k:m.get(k) for k in('name','authors','licenseUrl','avatarPermission','allowExcessivelyViolentUsage','commercialUsage','allowRedistribution','modification','creditNotation','otherLicenseUrl')}
        ver='VRM1'; bs=list(ext['VRMC_vrm'].get('expressions',{}).get('preset',{}).keys())+list(ext['VRMC_vrm'].get('expressions',{}).get('custom',{}).keys())
    morphs=sum(len(p.get('targets',[])) for me in j['meshes'] for p in me['primitives'][:1])
    print(f.split('/')[-1],ver,'meshes',len(j['meshes']),'mats',len(j.get('materials',[])),'nodes',len(j['nodes']))
    print('  ',json.dumps(out,ensure_ascii=False)); print('   expr:',len(bs),bs[:30])
