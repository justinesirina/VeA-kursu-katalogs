package lv.venta.coursecatalog.service.support;

import lv.venta.coursecatalog.model.support.Language;
import lv.venta.coursecatalog.repository.support.LanguageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LanguageService {

    @Autowired
    private LanguageRepository languageRepository;

    public List<Language> getAll() {
        return languageRepository.findAll();
    }

    public Language create(Language input) {
        return languageRepository.save(input);
    }

    public Language update(int id, Language input) throws Exception {
        Language existing = languageRepository.findById(id)
                .orElseThrow(() -> new Exception("Valoda nav atrasta pēc ID = " + id));
        existing.setName(input.getName());
        existing.setCode(input.getCode());
        return languageRepository.save(existing);
    }

    public void delete(int id) {
        languageRepository.deleteById(id);
    }
}
