package lv.venta.coursecatalog.service.courseinfo;

import lv.venta.coursecatalog.model.literature.LiteratureType;
import lv.venta.coursecatalog.repository.courseinfo.LiteratureTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class LiteratureTypeService {

    @Autowired
    private LiteratureTypeRepository typeRepo;

    /**
     * Iegūst visus literatūras veidus.
     */
    public List<LiteratureType> getAllTypes() {
        return typeRepo.findAll();
    }

    /**
     * Iegūst literatūras veidu pēc ID.
     */
    public LiteratureType getTypeById(int id) {
        return typeRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Nav atrasts literatūras veids ar id = " + id));
    }

    /**
     * Izveido jaunu literatūras veidu.
     */
    @Transactional
    public LiteratureType createType(LiteratureType type) {
        return typeRepo.save(type);
    }

    /**
     * Atjauno esošu literatūras veidu.
     */
    @Transactional
    public LiteratureType updateType(int id, LiteratureType updated) {
        LiteratureType existing = getTypeById(id);
        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        return typeRepo.save(existing);
    }

    /**
     * Dzēš literatūras veidu pēc ID.
     */
    @Transactional
    public void deleteTypeById(int id) {
        if (!typeRepo.existsById(id)) {
            throw new RuntimeException("Nav atrasts dzēšamais literatūras veids ar id = " + id);
        }
        typeRepo.deleteById(id);
    }
}
