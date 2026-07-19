import java.io.*;

public class CompileCheck {
    public static void main(String[] args) throws Exception {
        ProcessBuilder pb = new ProcessBuilder("mvn.cmd", "clean", "compile");
        pb.directory(new File("c:\\Users\\phihi_6b0xaz1\\Desktop\\Du_An\\mia-accessories-shop\\backend"));
        pb.redirectErrorStream(true);
        Process p = pb.start();
        
        BufferedReader reader = new BufferedReader(new InputStreamReader(p.getInputStream()));
        String line;
        StringBuilder output = new StringBuilder();
        while ((line = reader.readLine()) != null) {
            output.append(line).append("\n");
        }
        p.waitFor();
        
        try (FileWriter fw = new FileWriter("c:\\Users\\phihi_6b0xaz1\\Desktop\\Du_An\\mia-accessories-shop\\backend\\compile_output.txt")) {
            fw.write(output.toString());
        }
    }
}
