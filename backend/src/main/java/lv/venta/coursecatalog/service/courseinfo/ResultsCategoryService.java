package lv.venta.coursecatalog.service.courseinfo;

import lv.venta.coursecatalog.model.courseinfo.ResultsCategory;
import lv.venta.coursecatalog.repository.courseinfo.ResultsCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ResultsCategoryService {

    @Autowired
    private ResultsCategoryRepository categoryRepo;

    public List<ResultsCategory> getAllCategories() {
        return categoryRepo.findAll();
    }

    public ResultsCategory getCategoryById(int id) {
        return categoryRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Nav atrasta kategorija ar id = " + id));
    }

    @Transactional
    public ResultsCategory createCategory(ResultsCategory category) {
        return categoryRepo.save(category);
    }

    @Transactional
    public ResultsCategory updateCategory(int id, ResultsCategory updated) {
        ResultsCategory existing = getCategoryById(id);
        existing.setName(updated.getName());
        return categoryRepo.save(existing);
    }

    @Transactional
    public void deleteCategoryById(int id) {
        if (!categoryRepo.existsById(id)) {
            throw new RuntimeException("Nav atrasta dzēšamā kategorija ar id = " + id);
        }
        categoryRepo.deleteById(id);
    }
}
