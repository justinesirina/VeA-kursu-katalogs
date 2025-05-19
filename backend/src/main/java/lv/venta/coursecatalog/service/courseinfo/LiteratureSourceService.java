package lv.venta.coursecatalog.service.courseinfo;

import lv.venta.coursecatalog.model.courseinfo.LiteratureSource;
import lv.venta.coursecatalog.repository.courseinfo.LiteratureSourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class LiteratureSourceService {

    @Autowired
    private LiteratureSourceRepository sourceRepo;

    /**
     * Iegūst visus literatūras ierakstus.
     */
    public List<LiteratureSource> getAllSources() {
        return sourceRepo.findAll();
    }

    /**
     * Iegūst vienu literatūras ierakstu pēc ID.
     */
    public LiteratureSource getSourceById(int id) {
        return sourceRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Nav atrasts literatūras ieraksts ar id = " + id));
    }

    /**
     * Izveido jaunu literatūras ierakstu.
     */
    @Transactional
    public LiteratureSource createSource(LiteratureSource source) {
        return sourceRepo.save(source);
    }

    /**
     * Atjauno literatūras ierakstu.
     */
    @Transactional
    public LiteratureSource updateSource(int id, LiteratureSource updated) {
        LiteratureSource existing = getSourceById(id);
        existing.setCitation(updated.getCitation());
        existing.setLanguage(updated.getLanguage());
        existing.setUrl(updated.getUrl());
        existing.setType(updated.getType());
        existing.setCourseInfo(updated.getCourseInfo());
        existing.setUpdatedAt(updated.getUpdatedAt());
        return sourceRepo.save(existing);
    }

    /**
     * Dzēš literatūras ierakstu pēc ID.
     */
    @Transactional
    public void deleteSourceById(int id) {
        if (!sourceRepo.existsById(id)) {
            throw new RuntimeException("Nav atrasts dzēšamais literatūras ieraksts ar id = " + id);
        }
        sourceRepo.deleteById(id);
    }
}
