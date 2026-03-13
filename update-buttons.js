const fs = require('fs');
const path = require('path');

const cancelClass = 'h-12 rounded-2xl border-none bg-white/40 px-6 font-bold text-[#0A1F1C] hover:bg-[#44C3B2] hover:text-[#0A1F1C] transition-all dark:bg-white/10 dark:text-white dark:hover:bg-[#44C3B2] dark:hover:text-[#0A1F1C]';

const files = [
    'src/components/reservations/edit-reservation-dialog.tsx',
    'src/components/reservations/add-reservation-dialog.tsx',
    'src/components/food/edit-food-dialog.tsx',
    'src/components/food/add-food-dialog.tsx',
    'src/components/fleet/edit-boat-dialog.tsx',
    'src/components/fleet/add-boat-dialog.tsx',
    'src/components/blog/edit-article-dialog.tsx',
    'src/components/blog/add-article-dialog.tsx',
    'src/components/activities/edit-activity-dialog.tsx',
    'src/components/activities/add-activity-dialog.tsx'
];

const basePath = 'C:\\Users\\Pedro\\Documents\\Meu\\Greenbreeze-Admin';

for (const f of files) {
    const file = path.join(basePath, f);
    if (!fs.existsSync(file)) {
        continue;
    }

    let content = fs.readFileSync(file, 'utf8');

    // Match: <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-xl font-bold px-6">\n                                Cancelar\n                            </Button>
    content = content.replace(/<Button[^>]*?variant="ghost"[^>]*?>[\s\S]*?Cancelar[\s\S]*?<\/Button>/g,
        '<Button type="button" variant="outline" onClick={() => setOpen(false)} className="' + cancelClass + '">Cancelar</Button>'
    );

    fs.writeFileSync(file, content);
    console.log('Updated Cancel on', file);
}
